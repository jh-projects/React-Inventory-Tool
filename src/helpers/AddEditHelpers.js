import {RESTHandler } from '../api/RestAPI';
import Meta from './Meta';
import Labels from './Labels';

const METADATA = new Meta();
const LABELS = new Labels();


// since serial number is used as inventory entry list key, we have to make sure
// it isn't duplicated on entries, so run these checks
export async function addEditChecks(e) {
	
	// flag used to indicate if serial number is being updated in edit mode - if so, flag is passed for further processing
	let updatedSerialNumber = false;
	
	// CASE ADD ITEM
	if ( e.target.name === LABELS.btnTxt['add'] ) {
		// if serial number already exists - display message and stop
		if (this.props.inventoryEntryList.has(this.state.serialNumber) ) {
			alert( LABELS.notifications['alertSNConflict'] );	
			return [false, this.props.inventoryEntryList.get(this.state.serialNumber)];
		}

		let status = await RESTHandler('list', {entity: 'item', eId: this.state.serialNumber }, this.props.token)
		.then( (r) => {
			if (r.data.id === 404) return true;
			else if (this.OKStatus.indexOf(r.data.id) > 0) {	
				alert( LABELS.notifications['alertSNConflict'] );	
				return false;
			}
			else { 
				this.setState({lastErr: `(${r.data.message} [${r.data.id}])` });
				throw new Error();
			}
		})
		.catch( () => { this.setState({lastErr: `Communication error` }, () => false )})

		if (status === false) {

			return [false, this.props.inventoryEntryList.get(this.state.serialNumber)];
		}

		// if list size is already at max - display message and stop
		if ( this.props.inventoryEntryList.size >= METADATA.limits['MAX_LIST_SIZE'] ) {
			alert(LABELS.notifications['alertMaxItems'] + METADATA.limits['MAX_LIST_SIZE']);
			return [false, false];
		}
		
		// if adding entry - don't set updatedSerialNumber flag
		return [true, false];
	}
	

	
	// CASE EDIT ITEM
	else if ( e.target.name === LABELS.btnTxt['edit'] ) {
		
		// // if serial number field updated, and CANNOT be found in items to add list, set the update flag
		// // so parent component can delete old serial number and create new entry
		// if (! this.props.inventoryEntryList.has(this.state.serialNumber) ) {

		// 	// check the inventory DB to make sure the serial number isn't in there
		// 	const r = await this.RESTHandler('list', {entity: 'item', eId: this.state.serialNumber }, this.props.token)
		// 	if (parseInt(r) !== 404) {
		// 		// need some logic here to handle overwriting existing SN in DB
		// 		if (! window.confirm( LABELS.notifications['alertSNConflict'] ) )
		// 			return [false, this.props.inventoryEntryList.get(this.state.serialNumber)];
		// 	}

		// 	updatedSerialNumber = true;
		// }
		
		// if serial number field DOES exist in items to add list
		// else {
		// use listOrderIndex to verify whether the serial number belongs to the current entry
		let checkListOrderIndex = this.props.inventoryEntryList.get(this.state.serialNumber).listOrderIndex;
		
		// if it doesn't, display message and stop
		if ( this.state.listOrderIndex !== checkListOrderIndex ) {
			alert( LABELS.notifications['alertSNConflict'] );
			return [false, this.props.inventoryEntryList.get(this.state.serialNumber)];
			// }

			// NO CODE REQUIRED HERE
			// if the serial number exists and the listorderindex value matches the entry currently being edited,
			// the serial number field has not been updated, other fields may have been - proceed with edit
			
		}
		
		// if flow gets to here - don't set updatedSerialNumber flag, entry being edited
		return [true, updatedSerialNumber];
	}
	
	// default return values for serial number check and updatedSerialNumber
	return [false, false];
}


// send the entry back to parent component to add to/update inventory list and enable receive order view 
export async function prepAddEntry(e) {

		e.preventDefault();

		let [serialNumberCheck, updatedSerialNumber] = [false, false];

		// since serial number is used as inventory entry list key, we have to make sure
		// it isn't duplicated on entries, so check first if it's already in the
		// list of items to be added, and then the actual DB

		// addEditChecks() returns array with serialNumberCheck indicating check failed or passed, 
		// and updatedSerialNumber containing a flag if SN is updated in an edit operation
		[serialNumberCheck, updatedSerialNumber] = await this.addEditChecks(e);
		// prevent add/edit operation if serial number already exists in list
		if ( serialNumberCheck === false ) {
			return false;
		}

		this.props.addEntry(this.state, e.target.name, updatedSerialNumber);
		this.setState( {serialNumber : '', partNumber : '', addCounter: this.state.addCounter+1} );

}


// similar to addEditChecks() for serial, but returns back conflicting entry for display in view
// could probably be integrated into addEditChecks() fairly easily

export function findConflictingEntry(serial) {
	if ( this.props.inventoryEntryList.has(serial) ) {
		const entry = this.props.inventoryEntryList.get(serial);
		if (this.state.listOrderIndex !== this.props.inventoryEntryList.get(serial).listOrderIndex || this.props.isEditing === false) {
			this.setState({'conflictEntry' : entry}, () => console.log(this.state))
			return;
		}	
	}
	this.setState({'conflictEntry' : null})
}

