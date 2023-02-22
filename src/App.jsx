import { useState , useEffect , useRef, createRef} from 'react'
import './App.css'
import { findDOMNode } from "react-dom";
import * as ebsol from '../zebra.it-sol.it/rfid'


  

function App() {
/*  const [domRef, setDomRef] = useState(null);
  const [rfid,setRfid] = useState(null);
  const [content, setContent] = useState("CIAO")


  useEffect(() => {
    const rfid = window.rfid;

    console.log(rfid);

  },[])

  useEffect(() =>  {
    console.log('useEffect [domRef]', domRef)
    console.log(findDOMNode(domRef));
      setRfid();
      console.log('useEffect [domRef]', domRef)
    
  },[domRef]);


  useEffect(() => {
    console.log('useEffect [rfid]')
    if (rfid) {

    }
  },[rfid])


  function onEnum(e){

    setContent("a) looking...")
    console.log(e);

    setContent("b) looking...")
    rfid.enumerate();
    setContent("c) looking...")
  }
*/

  return (
    <>
      <button onClick={ebsol.enumerate}>PROVA1 1</button>
      <p></p>
    </>
  )
}


export default App
