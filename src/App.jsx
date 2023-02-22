import * as ebsol from '../zebra.it-sol.it/rfid'


  

function App() {

  ebsol.onTagEvent(tagJson=>{
    
  })
  return (
    <>
      <button onClick={ebsol.startInventory}>PROVA1 1</button>
      <p></p>
    </>
  )
}


export default App
