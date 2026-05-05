import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../layouts/Loader.jsx';
import { useAuth } from './session';

const adminPortalRoles = ['institute', 'alumni_office', 'placement_cell'];

const ProtectedRoute = ({ children, allowedRoles = adminPortalRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const authenticated = !!(user?._id && adminPortalRoles.includes(user.role));
    const authorized = authenticated && allowedRoles.includes(user.role);

    if (loading) return <Loader show />;
    if (!authenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!authorized) return <Navigate to="/dashboard" replace />;

    return children;
};

export default ProtectedRoute;
