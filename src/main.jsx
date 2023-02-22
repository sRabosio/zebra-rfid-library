import React, {createRef, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'



/*window.EnumRfid = (rfidArray) => {
  alert(rfidArray);
  setContent("almost there...")
  if(!rfidArray){
    setContent("no scanners found!!")
    return
  }
  const newContent = "RFID on device: " + rfidArray.length + "--"
  +rfidArray[0][0] + "name" + rfidArray[0][1]
  setContent(newContent) 
}    

if (window.rfid)
{
  window.rfid.enumRFIDEvent = "EnumRfid(%s);";
  rfid.enumerate();
}
else {
  alert('no')
}*/


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
