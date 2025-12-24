import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Users from './pages/Users';
import AddUser from './pages/AddUser';
import Institutes from './pages/Institute';
import Feedback from './pages/FeedBack';
import EditInstitute from './pages/EditInstitute';
import Company from './pages/Company';
import AddCompany from './pages/AddCompany';
import EditCompany from './pages/EditCompany';
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
            
            <Route path='/add-user' element={
                <AuthGuard>
                    <AddUser />
                </AuthGuard>
            } />
            
            <Route path='/add-company' element={
                <AuthGuard>
                    <AddCompany />
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
            
            <Route path='/company' element={
                <AuthGuard>
                    <Company />
                </AuthGuard>
            } />
            
            <Route path='/edit-institute' element={
                <AuthGuard>
                    <EditInstitute />
                </AuthGuard>
            } />
            
            <Route path='/edit-company' element={
                <AuthGuard>
                    <EditCompany />
                </AuthGuard>
            } />
            
            {/* Commented out routes left as is */}
            {/* <Route path='/edit-user' element={<EditUser />} /> */}
            {/* <Route path='/add-Institute' element={<AddInstitute/>}/> */}
        </Routes>
    )
}

export default Markup;