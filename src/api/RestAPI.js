const apiOperations = {
	login: { path: process.env.REACT_APP_API_EP_LOGIN, method: 'POST' },
	adduser: { path: process.env.REACT_APP_API_EP_ADDUSER, method: 'POST'},
	list: { path: process.env.REACT_APP_API_EP_LIST, method: 'GET' }, 
	add: { path: process.env.REACT_APP_API_EP_ADD, method: 'POST' },
	edit: { path: process.env.REACT_APP_API_EP_EDIT, method: 'PUT' },
	remove: { path: process.env.REACT_APP_API_EP_REMOVE, method: 'DELETE' }
}



export async function RESTHandler(op, data, token=null) {
	
	
	try {
		if (! (op in apiOperations)) {
			const errMsg = { message: 'Unrecognized operation/endpoint' };
			throw(errMsg)
		}
		
		const requestConfig = { 	
			method: apiOperations[op]['method'],
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json', 
				},
		}
		
		if (apiOperations[op]['method'] !== 'GET' && apiOperations[op]['method'] !== 'DELETE') requestConfig.body = JSON.stringify(data);
		if (op !== 'login') requestConfig.headers['x-access-tokens'] = token;
		let endpoint = "";
		
		
		if ('entity' in data) endpoint += data.entity + "/";
		if ('eId' in data) endpoint += data.eId;
	
	
		const response = await fetch( process.env.REACT_APP_API_BASEURL + apiOperations[op]['path'] + endpoint, requestConfig)
		.then( response => { 
			if (response.ok) { 
				return response.json()
			} 
			else {
				throw(response)
			}
		})
		.then( response => { return response })
		return response;
		}

	
	// if it fails
	catch (error) {
		let errMsg = await error;
		if ( errMsg.status !== undefined ) {
			errMsg = await errMsg.json().then(err => err)
			console.error( `${op} operation failed (${errMsg.data.message} [HTTP ${errMsg.data.id}])` );
		}
		else {
			errMsg = { data: null};
			errMsg.data = { id: -1, message: error.message}
			console.error( `${op} operation failed (${errMsg.data.message} [${errMsg.data.id}])` );

			if (error.message === 'Failed to fetch') {
				errMsg.data.message = 'Network error connecting to REST endpoint ' + process.env.REACT_APP_API_BASEURL + apiOperations[op]['path']
			}
		}
		//controller.abort();
		return errMsg;		
	}
	
}
