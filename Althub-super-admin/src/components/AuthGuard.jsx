import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children }) => {
    const location = useLocation();
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (!(user?._id && user.role === 'admin')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
