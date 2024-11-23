import SignIn from "./auth/SignIn"
import { Outlet } from "react-router-dom"
function App() {

  return (
    <>
      <SignIn />
      <Outlet/>
    </>
  )
}

export default App

