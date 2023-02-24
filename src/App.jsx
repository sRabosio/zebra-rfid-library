import { useState } from 'react'
import * as ebsol from '../zebra.it-sol.it/rfid'
  

function App() {

  const [content, setContent] = useState(new Set())
  let currentRfid = null

  content.add("amongus1")
  content.add("amongus2")
  content.add("amongus3")
  console.log("destrct to array",[...content]);
  

  ebsol.onTagEvent(tagArray=>{
    if(tagArray.tagData.length > 1) return
    currentRfid = tagArray.tagData[0].tagID
    const newContent = new Set()
    newContent.add(...content)
    newContent.add(...tagArray.TagData.map(e=>e.tagID))
    setContent(newContent)
  })

  ebsol.onTagLocate(data=>{
    console.log("on locate tag",data);
  })


  return (
    <>
      <button onClick={ebsol.startInventory}>PROVA1 1</button>
      <button onClick={ebsol.stop}>STOP</button>
      <button onClick={()=>{ebsol.locateTag(currentRfid )}}>START LOCATE</button>
      {[...content].map(e=>{
        console.log(e);
        return <p>{e}</p>
        }
        )
      }
    </>
  )
}


export default App
