import { Routes, Route } from 'react-router-dom';
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
import AuthGuard from '../components/AuthGuard';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes (No Guard) */}
            <Route path='/' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/new-password' element={<NewPassword />} />

            {/* Protected Routes (Wrapped in AuthGuard) */}
            <Route path='/dashboard' element={
                <AuthGuard>
                    <Dashboard />
                </AuthGuard>
            } />

            <Route path='/profile' element={
                <AuthGuard>
                    <Profile />
                </AuthGuard>
            } />

            <Route path='/users' element={
                <AuthGuard>
                    <Users />
                </AuthGuard>
            } />

            <Route path='/placement-cell' element={
                <AuthGuard>
                    <PlacementCell />
                </AuthGuard>
            } />

            <Route path='/alumni-office' element={
                <AuthGuard>
                    <AlumniOffice />
                </AuthGuard>
            } />

            <Route path='/connected' element={
                <AuthGuard>
                    <Connected />
                </AuthGuard>
            } />

            <Route path='/institute' element={
                <AuthGuard>
                    <Institutes />
                </AuthGuard>
            } />

            {/* <Route path='/add-Institute' element={<AddInstitute/>}/> */}
        </Routes>
    )
}

export default AppRoutes;
