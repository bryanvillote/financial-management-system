import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <main>
        <Outlet /> {/* Renders the child routes under /app */}
      </main>
    </div>
  );
}

export default App;
