import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./utils/context/AuthContext";
import "./styles/index.css";
import { router } from "./router.jsx";

function Main() {
  return (
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Main />);

export default Main;
