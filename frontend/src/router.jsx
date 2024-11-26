import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AdminLog from './auth/AdminLogin.jsx';
import AdminRegister from './auth/AdminReg.jsx';
import ForgotPassword from './auth/ForgotPassword.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import Expenses from './expenses/Expenses.jsx';
import PersonalRecord from './personal-record/PersonalRecord.jsx';
import Receipt from './receipt/Receipt.jsx';
import HomeownersRegistration from './registration/HomeownerRegistration.jsx';
import Welcome from './welcome/Welcome.jsx';
import {Toaster} from "mui-sonner"

const router = createBrowserRouter([
    {
        path: '/', // Default route renders Welcome
        element: <Welcome />,
    },
    {
        path: '/login', // Login route
        element: (
        <>
            <Toaster position="top-right" />
            <AdminLog />
        </>
        ),
    },
    {
        path: '/register', // Registration route
        element: <AdminRegister />,
    },
    {
        path: '/forgot-password', // Forgot Password route
        element: <ForgotPassword />,
    },
    {
        path: '/app', // Protected app routes
        element: <ProtectedRoute><App /></ProtectedRoute>,
        children: [
            { path: 'registration', element: <HomeownersRegistration /> },
            { path: 'receipt', element: <Receipt /> },
            { path: 'personal-record', element: <PersonalRecord /> },
            { path: 'expenses', element: <Expenses /> },
            { path: 'dashboard', element: <Dashboard /> },
        ],
    },
    {
        path: '*', // Catch-all route
        element: <div>404 - Page Not Found</div>,
    },
]);

export { router };

