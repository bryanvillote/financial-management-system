import { Toaster } from "mui-sonner";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AdminLog from "./auth/AdminLogin.jsx";
import AdminRegister from "./auth/AdminReg.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Billing from "./components/billing/Billing.jsx";
import Homeowners from "./components/dashboard/components/Homeowners.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import Expenses from "./components/expenses/Expenses.jsx";
import Receipt from "./components/receipt/Receipt.jsx";
import HomeownersRegistration from "./components/registration/HomeownerRegistration.jsx";
import Reports from "./components/reports/Reports.jsx";
import Welcome from "./components/welcome/Welcome.jsx";

const router = createBrowserRouter([
  {
    path: "/", // Default route renders Welcome
    element: <Welcome />,
  },
  {
    path: "/login", // Login route
    element: (
      <>
        <Toaster position="top-right" />
        <AdminLog />
      </>
    ),
  },
  {
    path: "/register", // Registration route
    element: <AdminRegister />,
  },
  {
    path: "/forgot-password", // Forgot Password route
    element: <ForgotPassword />,
  },
  {
    path: "/app", // Protected app routes
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { path: "/app/login", element: <AdminLog /> },
      {
        path: "/app/registration",
        element: (
          <ProtectedRoute>
            <HomeownersRegistration />
          </ProtectedRoute>
        ),
      },
      {
        path: "/app/receipt",
        element: (
          <ProtectedRoute>
            <Receipt />
          </ProtectedRoute>
        ),
      },
      {
        path: "/app/billing",
        element: (
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        ),
      },
      {
        path: "/app/expenses",
        element: (
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        ),
      },
      {
        path: "/app/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/app/homeowners",
        element: (
          <ProtectedRoute>
            <Homeowners />
          </ProtectedRoute>
        ),
      },
      {
        path: "/app/reports",
        element: (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        ),
      },
      { path: "/app/admin-register", element: <AdminRegister /> },
      { path: "/app/forgot-password", element: <ForgotPassword /> },
      { path: "registration", element: <HomeownersRegistration /> },
      { path: "receipt", element: <Receipt /> },
      { path: "billing", element: <Billing /> },
      { path: "expenses", element: <Expenses /> },
      { path: "homeowners", element: <Homeowners /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "reports", element: <Reports /> },
    ],
  },
  {
    path: "*", // Catch-all route
    element: <div>404 - Page Not Found</div>,
  },
]);

export { router };
