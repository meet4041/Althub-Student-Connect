/**
 * ProtectedRoute - Guards authenticated routes.
 * Redirects to login if no valid session exists.
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axiosInstance from '../service/axios';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/new-password', '/'];

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const instituteId = localStorage.getItem('AlmaPlus_institute_Id');
        if (!instituteId) {
            setStatus('unauth');
            return;
        }

        axiosInstance.get(`/api/getInstituteById/${instituteId}`)
            .then((response) => {
                if (response.data?.success && response.data?.data?._id) {
                    setStatus('ok');
                } else {
                    setStatus('unauth');
                }
            })
            .catch(() => setStatus('unauth'));
    }, [location.pathname]);

    if (status === 'loading') {
        return null;
    }

    if (status !== 'ok') {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
export { AUTH_PATHS };
