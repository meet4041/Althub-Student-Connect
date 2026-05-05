import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import NewPassword from '../pages/NewPassword';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Users from '../pages/Users';
import Institutes from '../pages/Institute';
import PlacementCell from '../pages/PlacementCell';
import AlumniOffice from '../pages/AlumniOffice';
import Connected from '../pages/Connected';
import Announcement from '../pages/Announcement';
import AuthGuard from '../auth/AuthGuard';

const protectedRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/profile', element: <Profile /> },
    { path: '/users', element: <Users /> },
    { path: '/placement-cell', element: <PlacementCell /> },
    { path: '/alumni-office', element: <AlumniOffice /> },
    { path: '/connected', element: <Connected /> },
    { path: '/announcement', element: <Announcement /> },
    { path: '/institute', element: <Institutes /> },
];

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/new-password' element={<NewPassword />} />
            {protectedRoutes.map(({ path, element }) => (
                <Route
                    key={path}
                    path={path}
                    element={<AuthGuard>{element}</AuthGuard>}
                />
            ))}

            <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
    )
}

export default AppRoutes;
