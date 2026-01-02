import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { WEB_URL } from '../baseURL';

const AuthGuard = () => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'unauth'
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('Althub_Id');
        if (!userId) {
            setStatus('unauth');
            return;
        }

        // Validate session with server using cookies (HttpOnly jwt_token)
        axios.get(`${WEB_URL}/api/searchUserById/${userId}`, { withCredentials: true })
            .then((res) => {
                if (res.data && res.data.data && res.data.data.length) setStatus('ok');
                else setStatus('unauth');
            })
            .catch(() => setStatus('unauth'));
    }, [navigate]);

    if (status === 'loading') return null; // or a spinner
    if (status === 'unauth') {
        // Remove client-side user id only; cookie is HttpOnly and handled by server
        localStorage.removeItem('Althub_Id');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;