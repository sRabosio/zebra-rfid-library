import { useState } from 'react'
import * as ebsol from '../zebra.it-sol.it/rfid'
  

function App() {

  const [content, setContent] = useState([])
  const [lastTag, setLastTag] = useState("")
  const [distance, setDistance] = useState("")

  
  ebsol.onInventory((tags, reads)=>{
    console.log("onInv res", {tags, reads})
    setContent(tags)
    setLastTag(tags.at(0).tagID)
  })

  ebsol.onTagLocate(data=>{
    console.log("on locate tag",data)
    setDistance(data.TagLocate)
  })

  ebsol.onScanSingleRfid(data=>{
    console.log("single found", data);
    setLastTag(data.tagID)
  })


  return (
    <>
      <button onClick={ebsol.startInventory}>PROVA1 1</button>
      <button onClick={ebsol.stop}>STOP</button>
      <button onClick={()=>{ebsol.locateTag(lastTag)}}>START LOCATE</button>
      <button onClick={ebsol.scanSingleRfid}>SCAN SINGLE</button>
      <h2>Last tag: {lastTag}</h2>
      <h2>Distance: {distance}</h2>
      <h2>TAGS FOUND</h2>
      {content.map(e=><p>{e.tagID}</p>)}  
    </>
  )
}


export default App
