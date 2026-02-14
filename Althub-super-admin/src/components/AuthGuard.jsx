import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const adminId = localStorage.getItem('AlmaPlus_admin_Id');

        if (adminId) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsChecking(false);
    }, [location]); // Re-check whenever the URL changes

    if (isChecking) return null; // Prevents "ghost" redirects

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
