import Labels from '../helpers/Labels';
import Meta from '../helpers/Meta';
const METADATA = new Meta();
const LABELS = new Labels();


// text field input
export function InputText(props) {
	
	const name = props.name;
	const value = props.value;
	
	let divider = <div className="ui hidden divider"></div>;
	let label =	<div className="ui label">{LABELS.fieldTxt[name]}</div>

	let activeColor = null;
	if (name.includes("filter") ) {
		divider = "";
		label = "";
		
		if (value !== '' && value !== 'PO-') activeColor = {backgroundColor: '#cfe1ff'};
	}

	return (

		<div>
		<div className="ui fluid labeled input">
			{label}
			
			<input name={name} required style={activeColor} placeholder="Filter" value={value} type="text" maxLength={METADATA.limits['maxFieldLength']} 
				onFocus={(e) => props.updateField(e,'')} onChange={props.updateField} disabled={props.disabled}/>
		</div>
			{divider}
		</div>
		);
}


// number field input
export function InputNumber(props) {
	
	const name = props.name;
	const value = props.value;
	
	return (

		<div>
		<div className="ui fluid labeled input">
			<div className="ui label">{LABELS.fieldTxt[name]}</div>
			
			<input name={name} required placeholder={LABELS.fieldTxt[name]} value={value} type="number" min="1" max={METADATA.limits['maxFieldNumber']} 
				onFocus={(e) => props.updateField(e,'')} onChange={props.updateField} />

		</div>
		<div className="ui hidden divider"></div>		
		</div>
		);
}


// select dropdown list input
export function InputSelect(props) {
	const name = props.name;
	const value = props.value;
	const customDefault = props.customDefault	// for custom default option message

	let label = <div className="ui label">{LABELS.selectTxt[name]}</div>
	let divider = <div className="ui hidden divider"></div>	

	let activeColor = null;
	if (name.includes("filter") ) {
		divider = "";
		label = "";
		
		if (value !== 0) activeColor = {backgroundColor: '#cfe1ff'};
	}

	// return a normal select dropdown; set the data-child attribute if the dropdown is part of a select group (final descedent has no
	// childSelect prop attribute passed down)
	if (props.datalist === undefined || props.datalist === false) {
		// populate the <select> element with options tags
		const options = props.options.map( (opt, idx) => { 
			let v = '';
			if (idx !== 0) { v = opt['id']; }
			return <option key={idx} value={v}>{opt['name']}</option> 
		});

		return (
			<div>
			<div className="ui fluid labeled input">
				{label}
				<select name={name} style={activeColor} data-child={props.childSelect} disabled={props.disabled} required value={value} onChange={props.updateField} >
				{/*	<option value={null}>{customDefault || LABELS.selectTxt[name]}</option> */}
					{options}
				</select>
			</div>
				{divider}	
			</div>
			);
		}
	// return a datalist select dropdown (dropdown with text field to add a value that doesn't appear in the list)
	else {
		const options = props.options.map( (opt, idx) => { return <option key={idx} value={opt['id']}>{opt['name']}</option> });
		return (
			<div>
			<div className="ui fluid labeled input">
				{label}
				<input list={name} data-child={props.childSelect} name={name} placeholder={LABELS.fieldTxt[name]} value={value} maxLength={METADATA.limits['maxFieldLength']} 
					onChange={props.updateField} />
				<datalist id={name}>
					{options}
				</datalist>
			</div>
				{divider}	
			</div>
		);	
	}	
}


