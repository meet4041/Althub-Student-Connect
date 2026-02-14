import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useSessionTimeout } from '../hooks/useSessionTimeout.js';
import Dashboard from '../pages/Dashboard.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Login from '../pages/Login.jsx';
import Profile from '../pages/Profile.jsx';
import Users from '../pages/Users.jsx';
import Events from '../pages/Events.jsx';
import AddEvent from '../pages/AddEvent.jsx';
import Posts from '../pages/Posts.jsx';
import AddPost from '../pages/AddPost.jsx';
import EditEvent from '../pages/EditEvent.jsx';
import Register from '../pages/Register.jsx';
import EditPost from '../pages/EditPost.jsx';
import NewPassword from '../pages/NewPassword.jsx';
import Feedback from '../pages/Feedback.jsx';
import Leaderboard from '../pages/Leaderboard.jsx';
import AlumniOffice from '../pages/AlumniOffice.jsx';
import PlacementOffice from '../pages/PlacementOffice.jsx';
import AlumniMembers from '../pages/AlumniMembers.jsx';
import AlumniEvents from '../pages/AlumniEvents.jsx';
import AlumniAddCourse from '../pages/AlumniAddCourse.jsx';
import AlumniAddEvent from '../pages/AlumniAddEvent.jsx';
import AlumniEditEvent from '../pages/AlumniEditEvent.jsx';
import AlumniPosts from '../pages/AlumniPosts.jsx';
import AlumniAddPost from '../pages/AlumniAddPost.jsx';
import AlumniEditPost from '../pages/AlumniEditPost.jsx';
import PlacementEvents from '../pages/PlacementEvents.jsx';
import PlacementAddCourse from '../pages/PlacementAddCourse.jsx';
import PlacementAddEvent from '../pages/PlacementAddEvent.jsx';
import PlacementEditEvent from '../pages/PlacementEditEvent.jsx';
import PlacementPosts from '../pages/PlacementPosts.jsx';
import PlacementAddPost from '../pages/PlacementAddPost.jsx';
import PlacementEditPost from '../pages/PlacementEditPost.jsx';

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
