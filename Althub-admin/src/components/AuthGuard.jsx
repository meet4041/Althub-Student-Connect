import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    // FIX: Check for both token and user ID for security
    const hasToken = !!localStorage.getItem('AlmaPlus_admin_Token');
    const hasId = !!localStorage.getItem('AlmaPlus_admin_Id');
    
    if (!hasToken || !hasId) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AuthGuard;