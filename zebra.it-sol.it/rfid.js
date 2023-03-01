/*
*		---NOTES---
*
* tagEvent is used for multiple operations and thus should be reassigned before doing any operation
*
* TODO: locate tag
*
* TODO: revert to default settings after single scan
*/


//definitions
let onTagEvent = ()=>{}
let onSingleScanEvent = ()=>{}

window.statusHandler = status=>{
	console.log("status", status);
	if(status.errorCode != 1000){
		console.error("ERROR WITH CODE"+status.errorCode	 + "\n" + status.method + " "+status.vendorMessage)
		
		//LO SCHIFO PIU' TOTALE PARTE UNO
		//RIMUOVERE IL PRIMA POSSIBILE
		window.location.reload()
		alert(status.errorCode + status.vendorMessage)
	}
}

const singleScanOpt = {
	stopTriggerType: "tagObservation",
	stopObservationCount: 1
}

const performInventoryOpt = {
	stopTriggerType: "duration",
	stopObservationCount: 100000
}


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

window.scanSingleRfidHandler = dataArray=>{
	onSingleScanEvent(dataArray.TagData.at(0))
	rfid.stop() 
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



function init(){
	defaultProperties()
	rfid.statusEvent = "statusHandler(%json)"
		//non rimuovere
	getReader()
	//console.log("readerid", rfid.readerID);
}

function getReader(){
	onEnumerate(readers=>{
		console.log("readers found", readers);
		rfid.readerID = readers[0][0]
		console.log(readers[0][0]);
	})
	rfid.enumerate()
	rfid.connect()
}

function defaultProperties(){
	rfid.beepOnRead = 1
	rfid.transport = "serial"
	rfid.useSoftTrigger = 1
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
export const enumerate = ()=>rfid.enumerate()

/**
 * disconnects current rfid reader
 * 
 * WARNING: when no rfid reader is connected the program
 * may crash when starting an rfid operation
 */
export const disconnect = ()=>rfid.disconnect()

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
	console.log("starting...")

	//setting options
	rfid.stopTriggerType = performInventoryOpt.stopTriggerType
	rfid.stopObservationCount = performInventoryOpt.stopObservationCount

	rfid.tagEvent = "inventoryHandler(%json)"
	rfid.performInventory()
}

/***
 * @function
 * stops current operation
 */
export const stop = ()=>rfid.stop()

/**
 * @function
 * @param {function} callback - function that gets called during "startInventory()" execution
 */
export const onInventory = (callback)=>{
	onTagEvent = callback
}

export const scanSingleRfid = ()=>{

	//setting options
	rfid.stopTriggerType = singleScanOpt.stopTriggerType
	rfid.stopObservationCount = singleScanOpt.stopObservationCount

	rfid.tagEvent = "scanSingleRfidHandler(%json)"
	rfid.performInventory()
}

/**
 * @function
 * @param {function} callback - function that gets called during "scanSingleRfid" operation
 */
export const onScanSingleRfid = callback=>{
	onSingleScanEvent = callback
}



//keep at the bottom
const interInit = setInterval(()=>{
	if(rfid){
		clearInterval(interInit)	
		init()
	}
}, 300)


//LO SCHIFO PIU' TOTALE PARTE DUE
//RIMUOVERE IL PRIMA POSSIBILE
setInterval(()=>{
	window.statusHandler = status=>{
		if(status != 1000){
			log.error("error in zebralib")
			alert()
		}
	}
}, 2000)