import * as ebsol from '../zebra.it-sol.it/rfid'


  

function App() {

  ebsol.onEnumerate(()=>{
    alert("Hello from app")
  })

  return (
    <>
      <button onClick={ebsol.enumerate}>PROVA1 1</button>
      <p></p>
    </>
  )
}


export default App
