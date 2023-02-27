import { useState } from 'react'
import * as ebsol from '../zebra.it-sol.it/rfid'
  

function App() {

  const [content, setContent] = useState(new Set())
  let currentRfid = null

  content.add("amongus1")
  content.add("amongus2")
  content.add("amongus3")
  console.log("destrct to array",[...content]);
  
  
  ebsol.onInventory((tags, reads)=>{
    console.log("onInv res", {tags, reads});
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
