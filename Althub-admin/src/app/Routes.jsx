import { useAuth } from '../auth/session';
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import { useSessionTimeout } from '../hooks/useSessionTimeout.js';
import Dashboard from '../portals/institute/pages/Dashboard.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Login from '../pages/Login.jsx';
import Profile from '../portals/institute/pages/Profile.jsx';
import Users from '../portals/institute/pages/Users.jsx';
import Events from '../portals/institute/pages/Events.jsx';
import AddEvent from '../portals/institute/pages/AddEvent.jsx';
import Posts from '../portals/institute/pages/Posts.jsx';
import AddPost from '../portals/institute/pages/AddPost.jsx';
import EditEvent from '../portals/institute/pages/EditEvent.jsx';
import Register from '../pages/Register.jsx';
import EditPost from '../portals/institute/pages/EditPost.jsx';
import NewPassword from '../pages/NewPassword.jsx';
import Feedback from '../portals/institute/pages/Feedback.jsx';
import Leaderboard from '../portals/institute/pages/Leaderboard.jsx';
import AlumniOffice from '../portals/institute/pages/AlumniOffice.jsx';
import PlacementOffice from '../portals/institute/pages/PlacementOffice.jsx';
import AlumniMembers from '../portals/alumni-office/pages/AlumniMembers.jsx';
import AlumniEvents from '../portals/alumni-office/pages/AlumniEvents.jsx';
import AlumniAddCourse from '../portals/alumni-office/pages/AlumniAddCourse.jsx';
import AlumniAddEvent from '../portals/alumni-office/pages/AlumniAddEvent.jsx';
import AlumniEditEvent from '../portals/alumni-office/pages/AlumniEditEvent.jsx';
import AlumniPosts from '../portals/alumni-office/pages/AlumniPosts.jsx';
import AlumniAddPost from '../portals/alumni-office/pages/AlumniAddPost.jsx';
import AlumniEditPost from '../portals/alumni-office/pages/AlumniEditPost.jsx';
import PlacementEvents from '../portals/placement-cell/pages/PlacementEvents.jsx';
import PlacementAddEvent from '../portals/placement-cell/pages/PlacementAddEvent.jsx';
import PlacementEditEvent from '../portals/placement-cell/pages/PlacementEditEvent.jsx';
import PlacementPosts from '../portals/placement-cell/pages/PlacementPosts.jsx';
import PlacementAddPost from '../portals/placement-cell/pages/PlacementAddPost.jsx';
import PlacementEditPost from '../portals/placement-cell/pages/PlacementEditPost.jsx';

const ROLES = {
    all: ['institute', 'alumni_office', 'placement_cell'],
    institute: ['institute'],
    alumniOffice: ['alumni_office'],
    placementCell: ['placement_cell'],
};

const portalRoutes = [
    { path: '/dashboard', element: <Dashboard />, roles: ROLES.all },
    { path: '/profile', element: <Profile />, roles: ROLES.all },

    { path: '/feedback', element: <Feedback />, roles: ROLES.institute },
    { path: '/users', element: <Users />, roles: ROLES.institute },
    { path: '/events', element: <Events />, roles: ROLES.institute },
    { path: '/add-event', element: <AddEvent />, roles: ROLES.institute },
    { path: '/edit-event', element: <EditEvent />, roles: ROLES.institute },
    { path: '/posts', element: <Posts />, roles: ROLES.institute },
    { path: '/add-post', element: <AddPost />, roles: ROLES.institute },
    { path: '/edit-post', element: <EditPost />, roles: ROLES.institute },
    { path: '/leaderboard', element: <Leaderboard />, roles: ROLES.institute },
    { path: '/alumni-office', element: <AlumniOffice />, roles: ROLES.institute },
    { path: '/placement-office', element: <PlacementOffice />, roles: ROLES.institute },

    { path: '/alumni-members', element: <AlumniMembers />, roles: ROLES.alumniOffice },
    { path: '/alumni-events', element: <AlumniEvents />, roles: ROLES.alumniOffice },
    { path: '/alumni-add-course', element: <AlumniAddCourse />, roles: ROLES.alumniOffice },
    { path: '/alumni-add-event', element: <AlumniAddEvent />, roles: ROLES.alumniOffice },
    { path: '/alumni-edit-event', element: <AlumniEditEvent />, roles: ROLES.alumniOffice },
    { path: '/alumni-posts', element: <AlumniPosts />, roles: ROLES.alumniOffice },
    { path: '/alumni-add-post', element: <AlumniAddPost />, roles: ROLES.alumniOffice },
    { path: '/alumni-edit-post', element: <AlumniEditPost />, roles: ROLES.alumniOffice },

    { path: '/placement-events', element: <PlacementEvents />, roles: ROLES.placementCell },
    { path: '/placement-add-event', element: <PlacementAddEvent />, roles: ROLES.placementCell },
    { path: '/placement-edit-event', element: <PlacementEditEvent />, roles: ROLES.placementCell },
    { path: '/placement-posts', element: <PlacementPosts />, roles: ROLES.placementCell },
    { path: '/placement-add-post', element: <PlacementAddPost />, roles: ROLES.placementCell },
    { path: '/placement-edit-post', element: <PlacementEditPost />, roles: ROLES.placementCell },
];

const Markup = () => {
  const { user, logout } = useAuth();
  const userDetails = user || {};

    const location = useLocation();

    useEffect(() => {
        const role = (user?.role);
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
            {portalRoutes.map(({ path, element, roles }) => (
                <Route
                    key={path}
                    path={path}
                    element={<ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>}
                />
            ))}
            <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default Markup;
