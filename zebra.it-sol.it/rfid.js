/*
*		---NOTES---
*
* tagEvent is used for multiple operations and thus should be reassigned before doing any operation
*
* TODO: locate tag
*/


//definitions
let onTagEvent = ()=>{}




const inventoryData = {
	tags: [],
	reads: new Array(50),
	chunk: function(newChunk){this.reads = new Array(newChunk)},
	addTag: function(newTag){
		const condition = this.tags.find(e=>e.tagID === newTag.tagID)
		if(condition) return
		this.tags.push(newTag)		
	}
}


window.inventoryHandler = dataArray=>{
	dataArray.TagData.forEach(e=>{
		inventoryData.addTag(e)
		inventoryData.reads.pop()
		inventoryData.reads.unshift(e)
	})
	const {tags, reads} = inventoryData
	onTagEvent(tags, reads)
}


rfid.transport = "serial"

function init(){
	console.log(rfid)
	//non rimuovere
	onEnumerate(readers=>{
		//console.log("readers found", readers);
		rfid.readerID = readers[0][0]
	})
	rfid.enumerate()
	rfid.connect()
	//console.log("readerid", rfid.readerID);
	
	defaultProperties
}


function defaultProperties(){
	rfid.beepOnRead = true
}

/**
 * Used to specify whether the device should beep whenever application receives a tag.
 * @param {boolean} value 
 */
export const beepOnRead = value=>rfid.beepOnRead = value

/**
 * sets transport mode for ...
 * 
 * default is serial
 * 
 * possible values: 
 * 	-serial
 *  -bluetooth 
 * 
 * @param {string} newTransport - new transport mode 
 */
export const setTransport = newTransport=>{rfid.transport = newTransport}

/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 */
export const enumerate = rfid.enumerate()

/**
 * disconnects current rfid reader
 * 
 * WARNING: when no rfid reader is connected the program
 * may crash when starting an rfid operation
 */
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
	rfid.tagEvent = "inventoryHandler(%json)"
	rfid.performInventory()
}

/***
 * @function
 * stops current operation
 */
export const stop = rfid.stop

/**
 * @function
 * @param {function} callback - function that gets called during "startInventory()" execution
 */
export const onInventory = (callback)=>{
	onTagEvent = callback
}

//keep at the bottom
init()