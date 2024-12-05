import { toast } from "mui-sonner";
import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );

  const logout = () => {
    toast.success("Logged out successfully");
    setTimeout(() => {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      window.location.href = "/login";
    }, 1000);
  };

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    setTimeout(() => {
      window.location.href = "/app/dashboard";
    }, 1000);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
