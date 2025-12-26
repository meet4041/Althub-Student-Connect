import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
    // 1. Retrieve the token specifically used in your App (Althub_Token)
    const token = localStorage.getItem("Althub_Token");

    // 2. If NO token is found, redirect users to the Login page
    // 'replace' ensures they can't click "Back" to return to the protected route
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. If token exists, render the child route (e.g., Home, Events)
    return <Outlet />;
};

export default AuthGuard;