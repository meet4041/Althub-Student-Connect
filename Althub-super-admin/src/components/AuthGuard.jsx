import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const isAuthenticated = () => {
    const adminId = localStorage.getItem('AlmaPlus_admin_Id');
    const userDetails = localStorage.getItem('userDetails');
    const token = localStorage.getItem('token');
    return !!(adminId && userDetails && token);
};

const AuthGuard = ({ children }) => {
    const location = useLocation();
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
export { isAuthenticated };
