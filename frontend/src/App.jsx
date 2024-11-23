import Login from "./auth/Login"
import { Outlet } from "react-router-dom"

function App() {

  return (
    <>
      <Login/>
      <Outlet/>
    </>
  )
}

export default App;

