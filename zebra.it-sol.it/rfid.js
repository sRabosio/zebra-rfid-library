


function init(){
	onEnumerate(readers=>{
		rfid.readerId = readers[0][0]
		alert(rfid.readerId)
	})
	rfid.enumerate()
	rfid.connect()
}

/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 */
export function enumerate(){
  return rfid.enumerate()
}



/**
 * @function
 * @param {function} callback - function that gets called during "enumerate()" execution
 */
export const onEnumerate = (callback)=>{
	window.enumRfid = callback
	rfid.enumRFIDEvent = "enumRfid(%s);"
}

/**
 * performs inventory and triggers tagEvent
 */
export function startInventory(){
	alert("start")
	alert(rfid.readerId)
	rfid.performInventory()
}

/**
 * @function
 * @param {function} callback - function that gets called during "performInventory()" execution
 */
export const onTagEvent = (callback)=>{
	window.tagHandler = callback
	rfid.tagEvent = "tagHandler(%json)"
}


//keep at the bottom
init()