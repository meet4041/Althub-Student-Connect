import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useSessionTimeout } from '../hooks/useSessionTimeout.js';
import Dashboard from '../features/institute/pages/Dashboard.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Login from '../pages/Login.jsx';
import Profile from '../features/institute/pages/Profile.jsx';
import Users from '../features/institute/pages/Users.jsx';
import Events from '../features/institute/pages/Events.jsx';
import AddEvent from '../features/institute/pages/AddEvent.jsx';
import Posts from '../features/institute/pages/Posts.jsx';
import AddPost from '../features/institute/pages/AddPost.jsx';
import EditEvent from '../features/institute/pages/EditEvent.jsx';
import Register from '../pages/Register.jsx';
import EditPost from '../features/institute/pages/EditPost.jsx';
import NewPassword from '../pages/NewPassword.jsx';
import Feedback from '../features/institute/pages/Feedback.jsx';
import Leaderboard from '../features/institute/pages/Leaderboard.jsx';
import AlumniOffice from '../features/institute/pages/AlumniOffice.jsx';
import PlacementOffice from '../features/institute/pages/PlacementOffice.jsx';
import AlumniMembers from '../features/alumni-office/pages/AlumniMembers.jsx';
import AlumniEvents from '../features/alumni-office/pages/AlumniEvents.jsx';
import AlumniAddCourse from '../features/alumni-office/pages/AlumniAddCourse.jsx';
import AlumniAddEvent from '../features/alumni-office/pages/AlumniAddEvent.jsx';
import AlumniEditEvent from '../features/alumni-office/pages/AlumniEditEvent.jsx';
import AlumniPosts from '../features/alumni-office/pages/AlumniPosts.jsx';
import AlumniAddPost from '../features/alumni-office/pages/AlumniAddPost.jsx';
import AlumniEditPost from '../features/alumni-office/pages/AlumniEditPost.jsx';
import PlacementEvents from '../features/placement-cell/pages/PlacementEvents.jsx';
import PlacementAddCourse from '../features/placement-cell/pages/PlacementAddCourse.jsx';
import PlacementAddEvent from '../features/placement-cell/pages/PlacementAddEvent.jsx';
import PlacementEditEvent from '../features/placement-cell/pages/PlacementEditEvent.jsx';
import PlacementPosts from '../features/placement-cell/pages/PlacementPosts.jsx';
import PlacementAddPost from '../features/placement-cell/pages/PlacementAddPost.jsx';
import PlacementEditPost from '../features/placement-cell/pages/PlacementEditPost.jsx';

const Markup = () => {
    const location = useLocation();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const title =
            role === 'placement_cell'
                ? 'Althub Placement Cell'
                : role === 'alumni_office'
                    ? 'Althub Alumni Office'
                    : 'Althub Admin';
        document.title = title;
    }, [location.pathname]);

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
            <Route path='/alumni-members' element={<ProtectedRoute><AlumniMembers /></ProtectedRoute>} />
            <Route path='/alumni-events' element={<ProtectedRoute><AlumniEvents /></ProtectedRoute>} />
            <Route path='/alumni-add-course' element={<ProtectedRoute><AlumniAddCourse /></ProtectedRoute>} />
            <Route path='/alumni-add-event' element={<ProtectedRoute><AlumniAddEvent /></ProtectedRoute>} />
            <Route path='/alumni-edit-event' element={<ProtectedRoute><AlumniEditEvent /></ProtectedRoute>} />
            <Route path='/alumni-posts' element={<ProtectedRoute><AlumniPosts /></ProtectedRoute>} />
            <Route path='/alumni-add-post' element={<ProtectedRoute><AlumniAddPost /></ProtectedRoute>} />
            <Route path='/alumni-edit-post' element={<ProtectedRoute><AlumniEditPost /></ProtectedRoute>} />
            <Route path='/placement-events' element={<ProtectedRoute><PlacementEvents /></ProtectedRoute>} />
            <Route path='/placement-add-course' element={<ProtectedRoute><PlacementAddCourse /></ProtectedRoute>} />
            <Route path='/placement-add-event' element={<ProtectedRoute><PlacementAddEvent /></ProtectedRoute>} />
            <Route path='/placement-edit-event' element={<ProtectedRoute><PlacementEditEvent /></ProtectedRoute>} />
            <Route path='/placement-posts' element={<ProtectedRoute><PlacementPosts /></ProtectedRoute>} />
            <Route path='/placement-add-post' element={<ProtectedRoute><PlacementAddPost /></ProtectedRoute>} />
            <Route path='/placement-edit-post' element={<ProtectedRoute><PlacementEditPost /></ProtectedRoute>} />
            <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default Markup;
