import React from 'react';
import AddDeviceEntry from './AddDeviceEntry';
import InventoryList from './InventoryList';
import {returnHome, setView, addEntry, deleteEntry, openEditView} from '../helpers/AppHelpers';
import {RESTHandler } from '../api/RestAPI';
import { LoginModal } from './LoginModal';


// text/button labels
import Labels from '../helpers/Labels';
const LABELS = new Labels();


class App extends React.Component {
	constructor(props) {
		super(props);

		this.RESTHandler = RESTHandler.bind(this);
		this.returnHome = returnHome.bind(this);
		this.setView = setView.bind(this);
		this.addEntry = addEntry.bind(this);
		this.deleteEntry = deleteEntry.bind(this);
		this.openEditView = openEditView.bind(this);
		
		// any input field or component that has "name" attribute must use the key name here that corresponds
		// to the field/component for that value - eg site <select> field - name="site"
		this.state = { 
			username : 'admin',
			password : 'password',
			token: null,
			
			rcvdDate: new Date().toISOString().slice(0,10),		// received date, defaults to today
			homeView : true,								// flag to enable receive order view
			addDeviceVisible : false,							// flag to enable review inventory list view
			prevSerialNumber : undefined,						// the previously entered serial number if an item was added to inventory - also used when editing items
			

			lookupRecords: {},
			loadingDB: false,	// flag to display loading DB spinner
			loginOpenState: true,
			loginFailed: false,
			loginMsg: null,
			refresh: false,	// flag to refresh the inventory list
			lastErr: null	// last error message
		};

		// master list for added inventory items - serialNumber is used as Map() key
		this.inventoryEntryList = new Map();
		
		this.isEditing = false; 	// flag to enable edit mode
		// for sorting list according to entry insertion order, incremented on each addition
		// note that this only loosely tracks insertion order - ie if items 1,2,3 exist and item 2 is deleted, item 3 does not become item 2
		// however, it will be reset to 0 if all entries are deleted
		this.orderCounter = 0;			
		
		// valid HTTP 2xx status codes
		this.OKStatus = Array.from(new Array(10), (x, i) => i + 200)

	}
	
		
	updateField =  async (e,value=e.target.value) => {
		this.setState( { [e.target.name] : value} );
	}
		
	
	// catch refresh/back if accidentally pressed
	componentDidMount() {
		window.onbeforeunload = function(event) { return "beforeunload"; };
		
		// FOR TESTING ONLY
		//this.loginWrapper();

	}

	resetRefresh = () => {
		this.setState({refresh:false});
	}

	closeModal = (modalState) => {
		this.setState( { [modalState] : false})
	}

	loginWrapper = async (e) => {
		if (e) e.preventDefault();

		let status = await this.RESTHandler('login', {'username': this.state.username, 'password': this.state.password} )
		.then( r => { 
			if ( this.OKStatus.indexOf(r.data.id) < 0) { 
				console.log(r.data.id)
				this.setState({loginFailed: true, lastErr: `(${r.data.message} [${r.data.id}])` });
				throw new Error();
			}
			else {
				this.setState( { token:r.data.token, loginFailed: false, loginMsg: r.data.message });
				this.closeModal('loginOpenState')
				//*******uncomment to load existing database */
				console.log('Logged in, loading inventory DB...')
				return true;
			}
		})
		.catch( () => { return false})
		if (status === false) return;

		this.loadDBRecords(this.state.token);
	}
		

	loadDBRecords = async (token) => {

		// load lookup values from DB
		this.setState( { loadingDB: true, refresh: true});
		const inventoryEntities = ['modelNumber','category','manufacturer','building','room','shelf'];
		let tempEntities = {};
		for (const ent of inventoryEntities) {
			let status = await this.RESTHandler('list', {entity: ent }, token)
			.then( r => { 
				if ( this.OKStatus.indexOf(r.data.id) < 0) { 
					this.setState({loadingDB: false, lastErr: `Cannot display inventory (${r.data.message} [${r.data.id}])` });
					throw new Error();
				}
				else { tempEntities[ent] = r.data.message; return true };
				}
			)
			.catch( () => { return false})
			if (status === false) return;
			
		}

		// load inventory DB 
		let status = await this.RESTHandler('list', {entity: 'item' }, token)
		.then ( (r) => {
			if ( this.OKStatus.indexOf(r.data.id) < 0) { 
				this.setState({loadingDB: false, lastErr: `Cannot display inventory (${r.data.message} [${r.data.id}])` });
				throw new Error();
			}

			r.data.message.forEach( (i, idx) => { 
				i.manufacturer = i.manufacturerId;
				i.modelNumber = i.modelNumberId;
				i.category = i.categoryId;
				i.building = i.buildingId; 
				i.room = i.roomId;
				i.shelf = i.shelfId
				i.status = 'In Inventory';
				i.listOrderIndex = idx;
				i.user = i.userId;
				this.inventoryEntryList.set(i.serialNumber,i);
				return true;
			});
		})
		.catch( () => { return false})
		if (status === false) return;

		this.orderCounter = this.inventoryEntryList.size;	
		this.setState( { lookupRecords: tempEntities, loadingDB: false } );
		console.log('Inventory DB loaded');
		console.log(this.inventoryEntryList);
	}

	
	logout = () =>  {
		if (window.confirm('Are you sure you want to log out?')) {
			this.orderCounter = 0;
			this.inventoryEntryList.clear();
			
			this.setState( { token:null, loginOpenState: true, lastErr: null} );
			console.log('Token removed, user logged out')
		}
	}
		
		
	// set up which view to display
	renderContent() {

		let currentView = null;
		let errMsg = null;
		let inventoryListView = null;
		let loadingDBSpinner = null;
		let headerText = "Inventory"; // header text to display by default on loading


		// display these fields for the receive entry data view
		if (this.state.homeView === true) {
			
			// receive order view
			currentView = (
			<LoginModal loginOpenState={this.state.loginOpenState} loginFailed={this.state.loginFailed} errMsg={this.state.lastErr} login={this.loginWrapper} updateField={this.updateField} ></LoginModal>
			)
		
			if ( this.state.loadingDB ) {
				loadingDBSpinner = (
					<div>
						<div className="ui active inverted dimmer">
						<div className="ui text loader">Loading Inventory...</div>
						</div>
					</div>
				)
			}

			if (this.state.lastErr !== null) {
				errMsg = <div className="ui item red message">{this.state.lastErr}</div>
			}

			// display the inventory list view component if there are items in inventory list
			if ( this.inventoryEntryList.size >  0) {
				inventoryListView = (
				<InventoryList refresh={this.state.refresh} resetRefresh={this.resetRefresh} inventoryEntryList={this.inventoryEntryList} setView={this.setView} lookupRecords={this.state.lookupRecords} 
				deleteEntry={this.deleteEntry} openEditView={this.openEditView} loginMsg={this.state.loginMsg} logout={this.logout}/>
				)
			}
			else {
				inventoryListView = <div><button className="ui button" onClick={ () => this.setView('addDeviceVisible') }>{LABELS.btnTxt['addDevice']}</button></div>
			}
		}

		
		// Add Device entry view
		else if (this.state.addDeviceVisible === true) {
			headerText = LABELS.labelTxt['addEditDeviceView'];
			currentView = <AddDeviceEntry lookupRecords={this.state.lookupRecords} prevSerialNumber={this.state.prevSerialNumber} 
			isEditing={this.isEditing} errHandler={this.errHandler} inventoryEntryList={this.inventoryEntryList} addEntry={this.addEntry} openEditView={this.openEditView} return={this.returnHome} token={this.state.token}/>;
		}

		return [headerText, errMsg, currentView, loadingDBSpinner, inventoryListView];
	}
	
		
	render(){
		return (
			<div className="ui container">
				{this.renderContent()}
			</div>
		);
	}
}



export default App;