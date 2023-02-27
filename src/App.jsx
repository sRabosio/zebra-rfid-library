import { useState } from 'react'
import * as ebsol from '../zebra.it-sol.it/rfid'
  

function App() {

  const [content, setContent] = useState([])
  const [lastTag, setLastTag] = useState("")
  const [distance, setDistance] = useState("")

  
  ebsol.onInventory((tags, reads)=>{
    console.log("onInv res", {tags, reads});
    setContent(tags)
    setLastTag(reads.at(-1).tagID)
  })

  ebsol.onTagLocate(data=>{
    console.log("on locate tag",data);
    setDistance(data.TagLocate)
  })


  return (
    <>
      <button onClick={ebsol.startInventory}>PROVA1 1</button>
      <button onClick={ebsol.stop}>STOP</button>
      <button onClick={()=>{ebsol.locateTag(lastTag)}}>START LOCATE</button>
      <h2>Last tag: {lastTag}</h2>
      <h2>Distance: {distance}</h2>
    </>
  )
}


export default App
