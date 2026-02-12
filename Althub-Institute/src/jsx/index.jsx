import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useSessionTimeout } from './hooks/useSessionTimeout.js';
import Dashboard from './pages/Dashboard.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Users from './pages/Users.jsx';
import Events from './pages/Events.jsx';
import AddEvent from './pages/AddEvent.jsx';
import Posts from './pages/Posts.jsx';
import AddPost from './pages/AddPost.jsx';
import EditEvent from './pages/EditEvent.jsx';
import Register from './pages/Register.jsx';
import EditPost from './pages/EditPost.jsx';
import NewPassword from './pages/NewPassword.jsx';
import Feedback from './pages/Feedback.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import AlumniOffice from './pages/AlumniOffice.jsx';
import PlacementOffice from './pages/PlacementOffice.jsx';

const Markup = () => {
    useSessionTimeout(true);

    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/new-password' element={<NewPassword />} />
            <Route path='/feedback' element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path='/events' element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path='/add-event' element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
            <Route path='/edit-event' element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
            <Route path='/edit-post' element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            <Route path='/posts' element={<ProtectedRoute><Posts /></ProtectedRoute>} />
            <Route path='/add-post' element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
            <Route path='/leaderboard' element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path='/alumni-office' element={<ProtectedRoute><AlumniOffice /></ProtectedRoute>} />
            <Route path='/placement-office' element={<ProtectedRoute><PlacementOffice /></ProtectedRoute>} />
            <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default Markup;