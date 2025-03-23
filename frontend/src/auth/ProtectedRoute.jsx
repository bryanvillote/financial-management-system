import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const roleRouteMap = {
  "/app/dashboard": ["President", "Vice President"],
  "/app/reports": ["President", "Vice President"],
  "/app/expenses": ["President"],
  "/app/homeowners": ["President"],
  "/app/billing": ["President", "Treasurer"],
  "/app/admin-register": ["President"],
  "/app/receipt": ["President", "Vice President", "Home Owner"],
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;
  const currentPath = window.location.pathname;

  const allowedRoles = roleRouteMap[currentPath];
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/app/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
