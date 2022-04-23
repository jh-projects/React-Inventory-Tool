class Labels {
	// button text
		btnTxt = {
			login : "Login",
			list : "List Inventory",
			add : "Add",
			cancel : "Cancel",
			del : "Delete",
			edit : "Edit",
			returnToHome : "Return",
			filter: 'Filter',			

			addDevice : "Add Device",

			
		};
	
	// field labels
		labelTxt = {
			addEditDeviceView : "Add/Edit Device",
			addEditPartView : "Add/Edit Part",
			reviewView : "Review/Upload Inventory Entries",
			rcvdDate : "Date",
		}

	// select field text
		selectTxt = {
			category : "Category",
			manufacturer: "Manufacturer",
			modelNumber : "Model Number",
			storageLocation : "Location",		// for devices
			shelfID : "Shelf ID",
			shelf : "Shelf",
			building : "Building",
			room : "Room",
			sortBy : "Sort By",
	};

	//	text field placeholders (also some labels)
		fieldTxt = {
			username : "Username",
			password : "Password",
			poNumber : "PO#",
			modelNumber : "Model",
			partNumber : "Part Number",
			serialNumber : "Serial",
			quantity : "Quantity",
		};
		
		
		// inventory list entry display text
		listTxt = {
			poNumber : "PO#",
			category : "Category",
			manufacturer: "Manufacturer",
			serialNumber : "Serial Number",
			storageLocation : "Location",
			modelNumber : "Model Number",
			partNumber : "Part Number",
			quantity : "Quantity",
			dateRcvd : 'Date Rcvd',
		};
		
		// errors, confirmations, alerts
		notifications = {
			confirmDelete : "Delete item ",
			alertNoItems : "No items in inventory",
			alertMaxItems : "Maximum number of entries is ",
			alertSNConflict : "Serial number is already assigned to another entry",
			inventoryListConflict : "Serial number already exists",
			RESTGenError : "Error generating REST API endpoint ",
			statusPending : "Upload pending",
			statusInventory : "Inventory",

		}
}

export default Labels;