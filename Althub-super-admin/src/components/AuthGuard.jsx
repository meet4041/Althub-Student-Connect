import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axiosInstance from '../services/axios';

const AuthGuard = ({ children }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const adminId = localStorage.getItem('AlmaPlus_admin_Id');

        if (!adminId) {
            setIsAuthenticated(false);
            setIsChecking(false);
            return;
        }

        axiosInstance.get(`/api/getAdminById/${adminId}`)
            .then((response) => {
                if (response.data?.success && response.data?.data?._id) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsChecking(false));
    }, [location]); // Re-check whenever the URL changes

    if (isChecking) return null; // Prevents "ghost" redirects

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
