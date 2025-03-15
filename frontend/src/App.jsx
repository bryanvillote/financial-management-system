import { Toaster } from "mui-sonner";
import { Outlet } from "react-router-dom";
import SideMenu from "./components/dashboard/components/SideMenu";
import { useAuth } from "./utils/context/useAuth";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <main>
        <Toaster position="top-right" />
        {isAuthenticated && <SideMenu />}
        <Outlet />
      </main>
    </div>
  );
}

export default App;
