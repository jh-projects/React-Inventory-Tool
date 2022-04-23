// container component to display inventory list


import React from 'react';
import InventoryListItem from './InventoryListItem';
import {InputText, InputSelect} from './InputFields';

// text/button labels
import Labels from '../helpers/Labels';
const LABELS = new Labels();

class InventoryList extends React.Component {
	constructor(props) {
		super(props);
		
		this.updateField = this.updateField.bind(this);

		// default sort method
		this.state = {
			sortBy : 'listOrderIndex',
			filter_poNumber: 'PO-',
			filter_serialNumber: '',
			filter_category: 0,
			filter_manufacturer: 0,
			filter_modelNumber: 0,

			filterToggle: 1,

			itemList: Array.from(this.props.inventoryEntryList, ([key, data]) => (data))
		}
		
		//this.inventoryEntities = ['modelNumber','category','manufacturer','building','room','shelf'];
		// sort list types - can add types as needed, and modify sortList() below to sort by that type
		this.optionsSortBy = [ 'Entry Order', 'PO #' ];

		const selectDefault = [ {id:0,name: 'Filter', pId:null} ] 
		this.filter_categoryOptions = selectDefault.concat(this.props.lookupRecords['category']);;
		this.filter_manufacturerOptions = selectDefault.concat(this.props.lookupRecords['manufacturer']);
		this.filter_modelNumberOptions = selectDefault.concat(this.props.lookupRecords['modelNumber']);
		this.filter_locationOptions = [];

	}

	componentDidMount = async () => {
		// load inventory DB and lookup values from REST API

		//const selectDefault = [ {id:0,name: 'Filter', pId:null} ] 
		//this.filter_categoryOptions = selectDefault.concat(this.props.lookupRecords['category']);
		//this.filter_manufacturerOptions = selectDefault.concat(this.props.lookupRecords['manufacturer']);
		//this.filter_modelNumberOptions = selectDefault.concat(this.props.lookupRecords['modelNumber']);
		
		//this.filter_locationOptions = selectDefault.concat(this.props.lookupRecords['location']);

		//this.forceUpdate();		// last lookup table load timing is sometimes off, force a refresh
	}

	componentDidUpdate = () => {

		if (this.props.refresh === true) {
			this.setState({itemList: Array.from(this.props.inventoryEntryList, ([key, data]) => (data))}, () => this.props.resetRefresh() );
		}
		
		const selectDefault = [ {id:0,name: 'Filter', pId:null} ] 
		this.filter_categoryOptions = selectDefault.concat(this.props.lookupRecords['category']);
		this.filter_manufacturerOptions = selectDefault.concat(this.props.lookupRecords['manufacturer']);
		this.filter_modelNumberOptions = selectDefault.concat(this.props.lookupRecords['modelNumber']);

	}

	// callback handlers
	deleteHandler = (serialNumber) => {
		this.props.deleteEntry(serialNumber);
	}
	
	editHandler = (serialNumber) => {
		this.props.openEditView(serialNumber);
	}
	
	// list sorting - allows sorting by order entries are added, or by PO#
	sortList(sortBy) {
		
		let tempList = null;
		// for sorting by entry order
		if (this.state.sortBy === 'listOrderIndex') {
			tempList = this.state.itemList;
			tempList.sort(function(a,b){ return a.listOrderIndex - b.listOrderIndex } );
			this.setState( { itemList: tempList}, () => this.forceUpdate())
		}
		
		// for sorting by PO#
		else if (this.state.sortBy === 'poNumber') {

			tempList = this.state.itemList;
			tempList.sort(function(a, b){
				const x = parseInt(a.poNumber.split("PO-")[1]);
				const y = parseInt(b.poNumber.split("PO-")[1]);

				if(x < y) { return -1; }
				if(x > y) { return 1; }
				return 0;
			});
			this.setState( { itemList: tempList}, () => this.forceUpdate())
		}

		// for sorting by PO#
		else if (this.state.sortBy === 'serialNumber') {
			tempList = this.state.itemList;
			tempList.sort(function(a, b){
				if(a.serialNumber < b.serialNumber) { return -1; }
				if(a.serialNumber > b.serialNumber) { return 1; }
				return 0;
			});
			this.setState( { itemList: tempList}, () => this.forceUpdate())
		}
	}

	// for updating input element values
	updateField(e,value=e.target.value) {	
		this.setState( { [e.target.name] : value} );
	}

	toggleFilter() {
		this.setState({ filterToggle : this.state.filterToggle ^ true })
	}
	setFilter = (e,name=e.target.name,value=(e.target.value)) =>
	{

		// set select dropdown default values to 0
		if (e.target.tagName === 'SELECT') {
			if (isNaN(parseInt(value))) { value = 0; }
			else { value = parseInt(value) }
		}

		if (e.target.name === 'filter_poNumber' && value.length < 3) value = 'PO-';
		if (e.target.name === 'filter_poNumber' && (! value.includes('PO-'))) value = 'PO-' + value;
		this.setState( { [name]: value} );

		// this delay is needed because some props take a bit of time to get down to their child elements
	 	setTimeout( () =>
		 	this.forceUpdate(), 50
	 	)
	 }
	
	render(){
		

		// convert inventory list to array, then sort by default sort method
		const entryList = this.state.itemList;
		

		// for each item
		const listItems = entryList
		.filter( (singleEntryData,idx) => { if (this.state.filter_poNumber.length === 0) return true; return singleEntryData.poNumber.includes(this.state.filter_poNumber.toUpperCase() ) })
		.filter( (singleEntryData,idx) => { if (this.state.filter_serialNumber.length === 0) return true; return singleEntryData.serialNumber.includes(this.state.filter_serialNumber.toUpperCase() ) })
		.filter( (singleEntryData,idx) => { if (this.state.filter_category === 0) return true; return singleEntryData.category === this.state.filter_category })
		.filter( (singleEntryData,idx) => { if (this.state.filter_manufacturer === 0) return true;  return singleEntryData.manufacturer === this.state.filter_manufacturer })
		.filter( (singleEntryData,idx) => { if (this.state.filter_modelNumber === 0) return true; return singleEntryData.modelNumber === this.state.filter_modelNumber })
		//.filter( singleEntryData => { console.log(singleEntryData.buildingId); return singleEntryData.buildingId === 1 })
		.map( (singleEntryData,idx) => <InventoryListItem key={idx} className="item" lookups={this.props.lookupRecords} item={singleEntryData} editHandler={this.editHandler} deleteHandler={this.deleteHandler} /> );
		
		
		let noItems = null;
		if ( entryList.length < 1) {
			noItems = (<tr><td colSpan="9" className="item sixteen wide">No items in inventory</td></tr>)
		}

		let allItemsFiltered = null;
		if ( listItems.length < 1 && entryList.length > 0) {
			allItemsFiltered = (<tr><td colSpan="9" className="item sixteen wide">All items filtered</td></tr>)
		}

		// render entry list and sort select element
		return (
			<div className="ui form segment left aligned">
				<div className="ui grid">
				
					<div className="four wide column">
						<button className="ui button" onClick={ () => this.props.setView('addDeviceVisible') }>{LABELS.btnTxt['addDevice']}</button>
					</div>
					<div className="eight wide column center aligned">

					</div>
					<div className="four wide column right aligned">
						<span style={{marginRight: 10}}>{this.props.loginMsg}</span>
						<button className="ui button" onClick={ () => this.props.logout() }>Logout</button>
					</div>


					{/*<div className="six wide column">
						<button className="ui button" style={{padding: 10, width: '38%', height: '50'}} onClick={ () => this.toggleFilter() }>
						<i style={{width:  '20%', height: '20%'}} className="filter icon"></i>	
						<i style={{width:  '20%', height: '20%'}} className="sort amount down icon"></i>	
						Filter/Sort</button>

					</div> */}
				</div>

				{this.props.errMsgUpload && <div className="ui item red message"><h5>{this.props.errMsgUpload}</h5></div> }
				<table className="ui unstackable striped table">
					<thead>
						<tr>
							<th className="item one wide">{LABELS.listTxt['poNumber']}</th>
							<th className="item two wide">{LABELS.listTxt['category']}</th>
							<th className="item two wide">{LABELS.listTxt['manufacturer']}</th>
							<th className="item two wide">{LABELS.listTxt['modelNumber']}</th>
							<th className="item two wide">{LABELS.listTxt['serialNumber']}</th>
							<th className="item two wide">{LABELS.listTxt['storageLocation']}</th>
							<th className="item two wide">{LABELS.listTxt['dateRcvd']}</th>
							<th className="item one wide">Edit</th>
							<th className="item one wide">Delete</th>
						</tr>
						{ Boolean(this.state.filterToggle) &&
						<tr>
							<th className="item two wide"><InputText name="filter_poNumber" value={this.state.filter_poNumber} updateField={this.setFilter}/></th>
							<th className="item two wide"><InputSelect name="filter_category"  value={this.state.filter_category} options={this.filter_categoryOptions} updateField={this.setFilter} /></th>
							<th className="item two wide"><InputSelect name="filter_manufacturer"  value={this.state.filter_manufacturer} options={this.filter_manufacturerOptions} updateField={this.setFilter} /></th>
							<th className="item two wide"><InputSelect name="filter_modelNumber"  value={this.state.filter_modelNumber} options={this.filter_modelNumberOptions} updateField={this.setFilter} /></th>
							<th className="item two wide"><InputText name="filter_serialNumber"  value={this.state.filter_serialNumber} updateField={this.setFilter}/></th>
							<th colSpan="4" className="item six wide">
							<div className="ui fluid labeled input">
							<div className="ui label">{LABELS.selectTxt['sortBy']}</div>
							<select name="sortBy" value={this.state.sortBy} onChange={ (e) => { this.setState({ [e.target.name] : e.target.value }, (e) => this.sortList(this.state.sortBy))} }>
								<option value='listOrderIndex'>Entry Order</option >
								<option value='poNumber'>PO #</option>
								<option value='serialNumber'>Serial Number</option>
							</select>
						</div>
							</th>
							{/*<th className="item">Status</th>*/}
						</tr>
						}
					</thead>
					<tbody>
						{noItems}
						{allItemsFiltered}
						{listItems}
					</tbody>
						
					
				</table>
			</div>
		);		
	}
}


export default InventoryList;