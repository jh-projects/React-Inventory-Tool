import React from 'react';
import {InputSelect, InputDatalist} from './InputFields';

import Labels from '../helpers/Labels';
const LABELS = new Labels();


class SelectGroup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {}
        
        this.selectNames = [];
        // extract all the select element names and their values from
        this.props.selectElements.forEach( s => {
            const [name, value] = s.split("|");
            this.state[name] = parseInt(value);
            this.selectNames.push(name);
        });
        
        // all the possible values for the selects will be stored here
        this.allOptions = {};

        // dropdown text for when dropdowns are unpopulated
        this.optionsDefaultValues = this.selectNames.map( (v, idx) => {
            if (idx > 0) { const parentSelect = this.selectNames[idx-1]; return `Select ${parentSelect} to see options` }
            else {  return `Select a ${v}` }

        });

        // this array hold the current option values of each select element
        // set the initial default message value in each dropwdown;  Also include the field name in the stateField key
        // so that it can be modified by setstate when any dropdown in the group is changed
        this.optionsValues = this.selectNames.map( (v, idx) => {
            return [{id: idx, name: this.optionsDefaultValues[idx], pId: null, stateField: v}]
        });

	}
	
	componentDidMount = async () => {

        // get all the select values from REST API
        for (const v of this.selectNames ) {
                this.allOptions[v] = this.props.lookupRecords[v];
        }

        // load the root dropdown with values
        const rootSelect = this.selectNames[0];
		let optDefault =  [ {id:0, name: `Select a ${rootSelect}`, pId:null, stateField: rootSelect}]
        let optValues = this.allOptions[rootSelect].map( option => {  return { id: option.id, name: option.name, pId: null}});
        this.optionsValues[0] = optDefault.concat(optValues);
        
        // if in editing mode (ie the root select has a non-zero value)
        // set the child dropdowns
        if (this.state[rootSelect] !== 0) {
            for (let i = 1; i < this.selectNames.length; i++) {
              
                const parentSelect = this.selectNames[i-1];
                const childSelect = this.selectNames[i];

                // using the parent's value as a filter, get a list of all the valid options for the child
                // pId - parentID field - is key to set here
                optDefault =  [ {id: 0, name: `Select a ${childSelect}`, pId: null, stateField: childSelect}]
                optValues = this.allOptions[childSelect].map(v => {  return { id:v.id, name: v.name, pId: v[parentSelect].id}})
                .filter( v => { return v['pId'] === this.state[parentSelect] });;
                this.optionsValues[i] = optDefault.concat(optValues);
                
            }
        }
		this.forceUpdate();
	}
	
	

	// called from select fields, updates state object with field value
	updateField = async (e,value=e.target.value) => {

        value = parseInt(value);

        // if the dropdown has a child dropdown linked (ie the child dropdown options depend on the value of the current dropdown),
        // get the child dropdown options
        if (e.target.dataset.child !== undefined) {

            const parentSelect = e.target.name;
            const childSelect = e.target.dataset.child;

            // find the array index of the child's name
            const optIdx = this.selectNames.indexOf(childSelect);
            
            // set the default message in the child dropdown
            let selectDefault = [ {id:0,name: `Select a ${childSelect}`, pId:null, stateField: childSelect}]
            let selectOpts = [];

            if (value === 0) {   // if the parent dropdown is set to its default, set the child's message to default
                selectDefault =  [{ id: 0, name: this.optionsDefaultValues[optIdx], pId: null, stateField: childSelect}];
            }
            
            else { // otherwise, using the parent's value as a filter, get a list of all the valid options for the child
                selectOpts = this.allOptions[childSelect].map( option => { return { id: option.id, name: option.name, pId: option[parentSelect].id}})
                .filter( option => { return option['pId'] === value });
            }
            
            // merge default with retrieved values, set child's component state
            this.optionsValues[optIdx] = selectDefault.concat(selectOpts);
            this.setState( {[childSelect] : 0})

            // for grandchildren dropdowns - reset them all to their default messages, update their state values to default
            for (let i = optIdx+1; i < this.optionsValues.length; i++) {
                this.optionsValues[i] = [{ id: 0, name: this.optionsDefaultValues[i], pId: null, stateField: this.optionsValues[i][0].stateField}];
                this.setState( {[this.optionsValues[i][0].stateField] : 0})
            }

        }
        // set the parent dropdown's component state then push the entire select group's state up to the parent component
        this.setState( {[e.target.name] : value}, () => {
            const selectStates = this.selectNames.map( v => [v, this.state[v]]);
            this.props.updateField( Object.fromEntries(selectStates))
        });
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


        return (
            <div>
            {
                this.selectNames.map( (v, idx) => {
                if (idx < this.selectNames.length-1) {
                    return <InputSelect key={idx} name={v} disabled={this.optionsValues[idx].length <= 1} childSelect={this.selectNames[idx+1]} value={this.state[v]} options={this.optionsValues[idx]} updateField={this.updateField} />
                }
                else {
                    return <InputSelect key={idx} name={v} disabled={this.optionsValues[idx].length <= 1} value={this.state[v]} options={this.optionsValues[idx]} updateField={this.updateField} />
                }
                })
            }    
            </div>
        )
	}
}

export default SelectGroup;