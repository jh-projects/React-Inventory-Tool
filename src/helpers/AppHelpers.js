import { RESTHandler } from '../api/RestAPI';
import Labels from './Labels';
import Meta from './Meta';

const METADATA = new Meta();
const LABELS = new Labels();	


// return to main view from add or edit (cancel only)
export function returnHome(view) {
	
	this.setState( {homeView : true, [view] : false} );

	// if edit is cancelled, no need to reload DB
	if (this.isEditing === true) {
		this.isEditing = false;	// reset edit flag
		return;
	}

	this.isEditing = false;	// reset edit flag
	this.loadDBRecords(this.state.token);
	return; 
} 


// hide main view and enable requested view
export function setView(view) {

	// if trying to add entry and list is at max size, don't allow
	if (! this.isEditing && this.inventoryEntryList.size >= METADATA.limits['MAX_LIST_SIZE'] ) {
			alert(METADATA.notifications['alertMaxItems'] + METADATA.limits['MAX_LIST_SIZE'] );
			return false;
		}
	
	// enable the desired view
	this.setState( {homeView : false, [view] : true} );
}


// callback function for adding/editing new entries, triggered when add/edit button clicked in Add/edit entry views
// adds a new entry to inventory list, also handles editing of existing entries
export async function addEntry(newEntryData, btnIdentifier, updatedSerialNumber) {
	
	// CASE ADD ITEM: set order in which item was added to list for future sorting
	let isAdding = false; // flag for adding - used to keep add view on
	if ( btnIdentifier === LABELS.btnTxt['add'] ) {
		isAdding = true;
	}

	newEntryData['entity'] = 'item';
	newEntryData['manufacturerId'] = newEntryData.manufacturer;
	newEntryData['modelNumberId'] = newEntryData.modelNumber;
	newEntryData['buildingId'] = newEntryData.building;
	newEntryData['roomId'] = newEntryData.room;
	newEntryData['shelfId'] = newEntryData.shelf;
	newEntryData['categoryId'] = newEntryData.category;

	if (this.isEditing === false) {
		let status = await RESTHandler('add', newEntryData, this.state.token)
		.then( r => {
			if ( this.OKStatus.indexOf(r.data.id) < 0) { 
				this.setState({lastErr: `(${r.data.message} [${r.data.id}])` });
				throw new Error();
			}
			newEntryData['status'] = 'In Inventory';
			newEntryData.listOrderIndex = this.orderCounter;		// sorting counter
			// date is set here since entire DB isn't reloaded again and date is only used for display purposes
			newEntryData['rcvdDate'] = new Date(newEntryData['rcvdDate']);
			this.inventoryEntryList.set(newEntryData.serialNumber,newEntryData);
			return true;
		})
		.catch( () => { return false})

	}
	else {
		newEntryData['eId'] = newEntryData.serialNumber;
		let status = await RESTHandler('edit', newEntryData, this.state.token)
		.then( r => {
			if ( this.OKStatus.indexOf(r.data.id) < 0) { 
				this.setState({lastErr: `(${r.data.message} [${r.data.id}])` });
				throw new Error();
			}
			newEntryData['status'] = 'In Inventory';
			this.inventoryEntryList.set(newEntryData.serialNumber,newEntryData);
			this.isEditing = false;
			this.loadDBRecords(this.state.token);
			return true;
		})
		.catch( () => { return false})
	}
	
	
	// these parameters keep the add entry view open on each entry addition, must hit return to close view
	// returning from an edit operation will still close the edit view
	this.setState( {homeView : !isAdding, prevSerialNumber : newEntryData.serialNumber, 'addDeviceVisible' : isAdding} );
	
	console.log( this.inventoryEntryList.get(newEntryData.serialNumber) );
	return;
}

// deletes entry from inventory list, resets order sorting counter if all entries deleted
export async function deleteEntry(serialNumber) {
		
	if ( this.inventoryEntryList.size < 1 ) { 
		return; 
	}
	
	// confirm deletion
	if ( ! window.confirm(`Delete item PO#${this.inventoryEntryList.get(serialNumber).poNumber} / ${serialNumber} ?` ) ) {
		return false;
	}
	
	// delete entry
	let status = await RESTHandler('remove', { entity: 'item', eId: serialNumber}, this.state.token)
		.then( r => {
			if ( this.OKStatus.indexOf(r.data.id) < 0) { 
				this.setState({lastErr: `(${r.data.message} [${r.data.id}])` });
				throw new Error();
			}
			this.inventoryEntryList.delete(serialNumber);
			this.setState({refresh:true});
			return true;
		})
		.catch( () => { return false})
		if (status === false) return;

	
	if ( this.inventoryEntryList.size < 1 ) { 
		this.orderCounter = 0;		// reset the list order counter that is used for sorting
		//this.setState( {homeView : true} );
		return;
	}
}
	
	
// callback function trigged when edit button in list view clicked, enables edit view for entry
export function openEditView(serialNumber) {
	
	// set the previous serial number state to the serial number of item to edit
	this.setState( {prevSerialNumber : serialNumber} );

	this.isEditing = true;		// enable edit flag
	this.setView('addDeviceVisible'); 	// bring up add device view in edit mode
	
}


