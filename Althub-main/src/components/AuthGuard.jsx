import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
    // 1. Retrieve both the token and the user ID
    // Checking for both ensures the session is fully established and valid
    const token = localStorage.getItem("Althub_Token");
    const userId = localStorage.getItem("Althub_Id");

    // 2. If either the token OR the user ID is missing, redirect to Login
    if (!token || !userId) {
        // Safety Measure: Clear potential partial data to ensure a clean state for the next login
        localStorage.removeItem("Althub_Token");
        localStorage.removeItem("Althub_Id");

        // 'replace' ensures they can't click "Back" to return to the protected route
        return <Navigate to="/login" replace />;
    }

    // 3. If both exist, render the child route (e.g., Home, Events)
    return <Outlet />;
};

export default AuthGuard;