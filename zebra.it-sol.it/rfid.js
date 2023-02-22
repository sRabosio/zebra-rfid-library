



window.enumRfid = (rfidArray)=>{ 
			var rfidInfo = "RFID On Device: " + rfidArray.length + "--"
		  for (i=0; i < rfidArray.length; i++)
		  {
			rfidInfo = rfidInfo +"ID:"+ rfidArray[i][0] + '\nname:'+ rfidArray[i][1] + '\naddress '+rfidArray[i][2]
		  }
		  alert(rfidInfo)
}

/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 */
export function enumerate(){ 
  rfid.enumRFIDEvent = "enumRfid(%s);"
  return rfid.enumerate()
}



/**
 * @function
 * @param {function} callback - function that gets called during "enumerate()" execution
 */
export const onEnumerate = (callback)=>{
	window.enumRfid = callback
}

