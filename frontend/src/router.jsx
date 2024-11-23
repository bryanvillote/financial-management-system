import { createBrowserRouter } from "react-router-dom";
import Welcome from './welcome/Welcome.jsx';
import HomeownersRegistration from './registration/HomeownersRegistration.jsx';
import Receipt from './receipt/Receipt.jsx';
import PersonalRecord from './personal-record/PersonalRecord.jsx'
import Expenses from './expenses/Expenses.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import AdminRegister from './auth/AdminRegister.jsx'
import ForgotPassword from './auth/ForgotPassword.jsx'
import LogIn from './auth/LogIn.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [ // Define your routes as children of App
            { path: '/welcome', element: <Welcome /> },
            { path: '/registration', element: <HomeownersRegistration /> },
            { path: '/receipt', element: <Receipt /> },
            { path: '/personal-record', element: <PersonalRecord /> },
            { path: '/expenses', element: <Expenses /> },
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/admin-register', element: <AdminRegister /> },
            { path: '/forgot-password', element: <ForgotPassword /> },
            { path: '/log-in', element: <LogIn /> },
        ]
    },
])

export { router };