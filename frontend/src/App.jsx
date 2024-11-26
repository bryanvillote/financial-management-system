import { Outlet } from "react-router-dom";
import {Toaster} from 'mui-sonner'

function App() {
  return (
    <div>
      <main>
        <Outlet /> {/* Renders the child routes under /app */}
        <Toaster position="top-right"/>
      </main>
    </div>
  );
}

export default App;
