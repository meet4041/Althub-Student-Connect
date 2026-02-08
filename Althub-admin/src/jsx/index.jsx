import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Institutes from './pages/Institute';
import Feedback from './pages/FeedBack';
import PlacementCell from './pages/PlacementCell';
import AlumniOffice from './pages/AlumniOffice';
// Security Guard Import
import AuthGuard from '../components/AuthGuard';

const Markup = () => {
    return (
        <Routes>
            {/* Public Routes (No Guard) */}
            <Route path='/' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />

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

            <Route path='/institute' element={
                <AuthGuard>
                    <Institutes />
                </AuthGuard>
            } />

            <Route path='/feedback' element={
                <AuthGuard>
                    <Feedback />
                </AuthGuard>
            } />

            {/* <Route path='/add-Institute' element={<AddInstitute/>}/> */}
        </Routes>
    )
}

export default Markup;