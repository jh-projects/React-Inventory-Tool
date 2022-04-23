import React from 'react';

import Labels from '../helpers/Labels';
const LABELS = new Labels();

class InventoryListItem extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			showDetails : props.showDetails,	// if set, show full details on each entry

		};


		this.fields = {modelNumber: null, category:null, manufacturer:null, building:null, room:null, shelf:null };
		for (const p in this.fields) {
			const itemFieldId = this.props.item[p];
			this.fields[p] = this.props.lookups[p].filter( e => e.id === itemFieldId ).map( e => e.name );
		}

		this.poNumber = this.props.item['poNumber'];
		this.serialNumber = this.props.item['serialNumber'];
		this.rcvdDate = this.props.item['rcvdDate'];
		this.rcvdDateShow = new Date(this.props.item['rcvdDate']).toDateString();

	}

	componentDidMount = () => {

		for (const p in this.props.lookups) {
			const itemFieldId = this.props.item[p];
			this.fields[p] = this.props.lookups[p].filter( e => e.id === itemFieldId ).map( e => e.name );
		}
	}

	componentDidUpdate = () => {
		

		this.poNumber = this.props.item['poNumber'];
		this.serialNumber = this.props.item['serialNumber'];
		this.rcvdDateShow = new Date(this.props.item['rcvdDate']).toDateString();
		for (const p in this.props.lookups) {
			const itemFieldId = this.props.item[p];
			this.fields[p] = this.props.lookups[p].filter( e => e.id === itemFieldId ).map( e => e.name );
		}
	}


	// callback handlers
	deleteHandler = (serialNumber) => {
		this.props.deleteHandler(serialNumber);
	}
	
	editHandler = (serialNumber, entryType) => {
		this.props.editHandler(serialNumber,entryType);
	}

	// display details for individual entry
	render(){

	
	// entryType, partNumber, quantity
	const errMsg = this.props.errMsg;

		
	let {modelNumber, category, manufacturer, building, room, shelf } = this.fields

	//console.log(poNumber, category, manufacturer, modelNumber, serialNumber, building, room, shelf);

	
	// render entry short details by default - note the error message is used to show existing/conflicting serial entries if a duplicate serial number is entered in add/edit mode,
	// otherwise the message does not display
	// also displays all entry details when clicked
	return (
		<>
		<>
		{  errMsg === undefined &&
		<tr>
			<td className="item two wide">{this.poNumber}</td>
			<td className="item two wide">{category}</td>
			<td className="item two wide">{manufacturer}</td>
			<td className="item two wide">{modelNumber}</td>
			<td className="item two wide">{this.serialNumber}</td>
			<td className="item two wide">{building}<br/>{room}<br />{shelf}</td>
			<td className="item two wide">{this.rcvdDateShow}</td>
			<td className="item one wide center aligned"><i className="edit icon" name={LABELS.btnTxt['edit']} onClick={(e) => this.editHandler(this.serialNumber)} style={{cursor: "pointer"}} ></i></td>
			<td className="item one wide center aligned"><i className="trash alternate icon" name={LABELS.btnTxt['del']} onClick={(e) => this.deleteHandler(this.serialNumber)} style={{cursor: "pointer"}} ></i></td>
			
		</tr>
		}
		</>

		<>
		{ errMsg !== undefined && 
		<div>
			{errMsg ? <h5>{errMsg}</h5> : null}
				<i className="caret square right icon"></i>
				<strong>PO#</strong> {this.poNumber} | <strong>S/N</strong> {this.serialNumber} | {this.modelNumber}
		</div>
		}
		</>
		</>)
	}
}

export default InventoryListItem;