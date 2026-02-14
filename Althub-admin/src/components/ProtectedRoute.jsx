/**
 * ProtectedRoute - Guards authenticated routes.
 * Redirects to login if no valid session exists.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/new-password', '/'];

const isAuthenticated = () => {
    const instituteId = localStorage.getItem('AlmaPlus_institute_Id');
    return !!instituteId;
};

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const authenticated = isAuthenticated();

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
export { isAuthenticated, AUTH_PATHS };
