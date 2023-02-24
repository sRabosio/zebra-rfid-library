/*
*		---NOTES---
*
* tagEvent is used for multiple operations and thus should be reassigned before doing any operation
*
*
*/


function init(){
	console.log(rfid)
	//non rimuovere
	rfid.transport = "serial"
	onEnumerate(readers=>{
		console.log("readers found", readers);
		rfid.readerID = readers[0][0]
	})
	rfid.enumerate()
	rfid.connect()
	console.log("readerid", rfid.readerID);
	
}


/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 */
export const enumerate = rfid.enumerate()

export const disconnect = rfid.disconnect()

/**
 * @function
 * @param {function} callback - function that gets called during "enumerate()" execution
*/
export const onEnumerate = (callback)=>{
	window.enumRfid = callback
	rfid.enumRFIDEvent = "enumRfid(%s);"
}

/**
 * 
 * @param {function} callback - function called when locating a tag 
 */
export const onTagLocate = (callback)=>{
	window.tagLocateHandler = callback
}

/**
 * locates a tag with the given rfid
 */
export const locateTag = (tagId) =>{
	rfid.tagEvent = "tagLocateHandler(%json)"
    rfid.antennaSelected = 1;
    rfid.tagID = tagId
    rfid.locateTag();
}

/**
 * performs inventory and triggers tagEvent
*/
export function startInventory(){
	if(!rfid.readerID)
		console.log("no rfid reader", rfid.readerID)
	console.log("starting...")
	rfid.tagEvent = "tagHandler(%json)"
	rfid.performInventory()
}

/***
 * @function
 * stops current operation
 */
export const stop = rfid.stop

/**
 * @function
 * @param {function} callback - function that gets called during "performInventory()" execution
 */
export const onTagEvent = (callback)=>{
	window.tagHandler = callback
}

//keep at the bottom
init()