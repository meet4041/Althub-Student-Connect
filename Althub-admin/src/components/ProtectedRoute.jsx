import { useAuth } from '../context/AuthContext';
/**
 * ProtectedRoute - Guards authenticated routes.
 * Redirects to login if no valid session exists.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const allowedRoles = ['institute', 'alumni_office', 'placement_cell'];
    const authenticated = !!(user?._id && allowedRoles.includes(user.role));

    if (loading) {
        return null;
    }

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
