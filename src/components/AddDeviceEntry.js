// add item to DB
// displays view to add a device to the inventory list - manufacturer, model number, serial number, storage location, etc


import React from 'react';
import {addEditChecks, prepAddEntry, findConflictingEntry} from '../helpers/AddEditHelpers';
import InventoryListItem from './InventoryListItem';
import SelectGroup from './SelectGroup';
import {InputText, InputSelect} from './InputFields';


// text/button labels
import Labels from '../helpers/Labels';
const LABELS = new Labels();



class AddDeviceEntry extends React.Component {
	constructor(props) {
		super(props);
		
		// bindings for imported functions to have access to state/props
		this.addEditChecks = addEditChecks.bind(this);
		this.prepAddEntry = prepAddEntry.bind(this);
		this.findConflictingEntry = findConflictingEntry.bind(this);

		// any input field or component that has "name" attribute must use the key name here that corresponds
		// to the field/component for that value - eg poNumber <select> field - name="poNumber"
		this.state = {
			poNumber : '',							
			serialNumber : '',						
			category: 0,							
			manufacturer : 0,						
			modelNumber : 0,						
			building : 0,
			room : 0,
			shelf : 0,
			prevSerialNumber : this.props.prevSerialNumber, // for use while in editing mode
			listOrderIndex : -1,					// set by parent component once item added to list - for sorting inventory list view and finding conflicting entries
			conflictEntry: null,						// holds the details of a conflicting entry if found
			addCounter: 0						// running count of items added while view is opened
		};
		
		// remember non-unique details of previous entry for faster entry
		if (this.props.inventoryEntryList.has(this.state.prevSerialNumber)) {
			this.prevEntry = this.props.inventoryEntryList.get(this.state.prevSerialNumber);
			
			this.state.poNumber = this.prevEntry.poNumber;
			this.state.category = this.prevEntry.category;
			this.state.manufacturer = this.prevEntry.manufacturer;
			this.state.modelNumber = this.prevEntry.modelNumber;
			this.state.building = this.prevEntry.building;
			this.state.room = this.prevEntry.room;
			this.state.shelf = this.prevEntry.shelf;
			

			
			// load the serial number, list index
			if (this.props.isEditing) {

				this.state.status = this.prevEntry.status

				this.state.serialNumber = this.prevEntry.serialNumber;
				this.state.listOrderIndex = this.prevEntry.listOrderIndex;
				
				this.selectGroupModel = [this.state.manufacturer, this.state.modelNumber];
				this.selectGroupLocation = [this.state.building, this.state.room, this.state.shelf];
			}
		}


		//  fields for select group components, with values embedded
		this.itemSelects = [ `manufacturer|${this.state.manufacturer}`,`modelNumber|${this.state.modelNumber}`];
		this.locationSelects = [ `building|${this.state.building}`, `room|${this.state.room}`, `shelf|${this.state.shelf}`];

		// single select dropdowns - initialized in componentDidMount()
		this.optionsCategory = ['Select a category'];
	}

	
	componentDidMount = async () => {
		// load data from REST API into <select> elements	
		const categoryDefault = [ {id:0,name: 'Select a category', pId:null}]	
		this.optionsCategory = categoryDefault.concat(this.props.lookupRecords['category']);
		this.forceUpdate();
	}
	
	// callback to set this component's state value passed down via props for SelectGroup component
	setSelectGroupValue = (selectStates) => {
        this.setState(selectStates);
    }

	// called from input fields, updates state object with field value
	// name attribute in field element must match state property to be updated
	// eg this.state.myName property must have corresponding <input name="myName"> 
	updateField =  async (e,value=e.target.value) => {
		
		// todo - add something that remembers previous values set in text fields
		
		if (! (e.target.name === 'serialNumber' || e.target.name === 'poNumber')) {
			if (! isNaN(parseInt(value)) ) { value = parseInt(value) }
		}
		
		else if ( typeof(value) === "string") { value = value.toUpperCase() }

		if (e.target.name === "serialNumber") {	this.findConflictingEntry(value) }

		this.setState( { [e.target.name] : value});
	}
	

	
	render(){

		// set Add or Edit text as required
		let addOrEditFrm = LABELS.btnTxt['add'];
		let addOrEditBtnTxt = LABELS.btnTxt['add'];
		let returnOrCancelBtnTxt = LABELS.btnTxt['returnToHome'];		// this button returns to home screen, entries are saved as added
		if (this.props.isEditing) {
			addOrEditFrm = LABELS.btnTxt['edit'];
			addOrEditBtnTxt = LABELS.btnTxt['edit'];
			returnOrCancelBtnTxt = LABELS.btnTxt['cancel'];
		}

		
		// if serial number entered for entry already exists in inventory list, show and highlight the entry in the list
		// see render() for elements
		
		//let conflictEntry  = this.findConflictingEntry(this.state.serialNumber);


		return (
			<div>
				<div className="ui segment">
					<form onSubmit={this.prepAddEntry} name={addOrEditFrm}>
						<div className="ui form">

							<InputText name="poNumber" value={this.state.poNumber} updateField={this.updateField}/>
							<SelectGroup token={this.props.token} lookupRecords={this.props.lookupRecords} editValues={this.selectGroupModel} selectElements={this.itemSelects} updateField={this.setSelectGroupValue}/>
							<SelectGroup token={this.props.token} lookupRecords={this.props.lookupRecords} editValues={this.selectGroupLocation} selectElements={this.locationSelects} updateField={this.setSelectGroupValue}/>
							<InputSelect name="category" value={this.state.category} options={this.optionsCategory} updateField={this.updateField}/>

							
							<InputText name="serialNumber" disabled={this.props.isEditing} value={this.state.serialNumber}  updateField={this.updateField} />

							<div className="ui grid">
								<div className="two wide column">
									<span className="ui olive label">{this.state.addCounter} items added</span>
								</div>
								<div className="fourteen wide column center aligned">
									<button className="ui button" type="submit">{addOrEditBtnTxt}</button>
									<button className="ui button" name={LABELS.btnTxt['cancel']} onClick={ (e) => { e.preventDefault(); this.props.return('addDeviceVisible') }}>{returnOrCancelBtnTxt}</button>
								</div>
							</div>
							
						</div>
					</form>
					
					{// conditional rendering for serial number conflict message
					 (this.state.conflictEntry !== null) && 
						<div className="ui item red message">
							<InventoryListItem  item={this.state.conflictEntry} lookups={this.props.lookupRecords} errMsg={LABELS.notifications['inventoryListConflict']} />
						</div>
					}
					
				</div>
			</div>
		);
	}
}

export default AddDeviceEntry;