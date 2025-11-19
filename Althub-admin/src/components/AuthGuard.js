import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('AlmaPlus_admin_Token');
    
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AuthGuard;