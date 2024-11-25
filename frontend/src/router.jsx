import { createBrowserRouter } from "react-router-dom";
import Welcome from './welcome/Welcome.jsx';
import HomeownersRegistration from './registration/HomeownerRegistration.jsx';
import Receipt from './receipt/Receipt.jsx';
import PersonalRecord from './personal-record/PersonalRecord.jsx';
import Expenses from './expenses/Expenses.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import AdminRegister from './auth/AdminReg.jsx';
import ForgotPassword from './auth/ForgotPassword.jsx';
import AdminLog from './auth/AdminLogin.jsx';
import App from "./App.jsx";

// Custom ProtectedRoute component
import ProtectedRoute from './auth/ProtectedRoute.jsx';

const router = createBrowserRouter([
    {
        path: '/', // Default route points to Login
        element: <Welcome />,
    },
    {
        path: '/app', // App routes are nested under /app
        element: <App />,
        children: [
            { path: '/app/login', element: <AdminLog /> },
            {
                path: '/app/registration',
                element: (
                    <ProtectedRoute>
                        <HomeownersRegistration />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/app/receipt',
                element: (
                    <ProtectedRoute>
                        <Receipt />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/app/personal-record',
                element: (
                    <ProtectedRoute>
                        <PersonalRecord />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/app/expenses',
                element: (
                        <Expenses />
                ),
            },
            {
                path: '/app/dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            { path: '/app/admin-register', element: <AdminRegister /> },
            { path: '/app/forgot-password', element: <ForgotPassword /> },
        ],
    },
]);

export { router };
