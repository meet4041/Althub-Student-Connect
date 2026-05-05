import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './session';

const AuthGuard = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default AuthGuard;
