import { Toaster } from "mui-sonner";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <main>
        <Toaster position="top-right" />
        <Outlet /> {/* Renders the child routes under /app */}
      </main>
    </div>
  );
}

export default App;
