export function enumerate()
		{ 
		  rfid.enumRFIDEvent = "enumRfid(%s);"
		  rfid.enumerate();    
		}
window.enumRfid = (rfidArray)=>{ 
            var rfidInfo = "RFID On Device: " + rfidArray.length + "--";  
		  for (i=0; i < rfidArray.length; i++)
		  {
			rfidInfo = rfidInfo +"ID:"+ rfidArray[i][0] + '\nname:'+ rfidArray[i][1] + '\naddress '+rfidArray[i][2];
		  }
          alert(rfidInfo)
}


export const onEnumerate = ()=>{

}

