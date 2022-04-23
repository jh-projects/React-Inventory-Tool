class Meta {
	
	itemStatus = {
		pending: 'Pending',
		inInventory: 'In Inventory'

	};

	// // determine what list to upload entries to
	// deviceType = { 
	// 	server : "Server",
	// 	network : "Network",
	// 	thirdparty : "Third party"
	// };

	
	// // entry types
	// entryType = {
	// 	device : "device",
	// 	part : "part",
	// };
	

	limits = {
		MAX_LIST_SIZE : 100,			// maximum number of entries that can be added to list for upload
		maxFieldLength : 255,		
		maxFieldNumber : 999		// maximum value on number input fields (eg quantity)
	};
	
	notifications = { 
		alertMaxItems: 'Max items allowed is '
	}
		
	// these are mapped to inventoryEntryList properties for sorting list
	sortTypes = {
		listOrderIndex : 'Entry Order',
		poNumber : 'PO Number'
	};

}

export default Meta;