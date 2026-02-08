import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
import Leaderboard from './pages/Leaderboard.jsx'; // Already imported

const Markup = () => {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/feedback' element={<Feedback />} />
            <Route path='/new-password' element={<NewPassword />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/users' element={<Users />} />
            <Route path='/events' element={<Events />} />
            <Route path='/add-event' element={<AddEvent />} />
            <Route path='/edit-event' element={<EditEvent />} />
            <Route path='/edit-post' element={<EditPost />} />
            <Route path='/posts' element={<Posts />} />
            <Route path='/add-post' element={<AddPost />} />
            
            {/* ADDED LEADERBOARD ROUTE BELOW */}
            <Route path='/leaderboard' element={<Leaderboard />} />
            
        </Routes>
    )
}

export default Markup;