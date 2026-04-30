import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ALTHUB_API_URL } from '../config/baseURL';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const authGenerationRef = useRef(0);
    const nav = useNavigate();

    const fetchUser = async () => {
        const requestGeneration = authGenerationRef.current;
        try {
            const res = await axios.get(`${ALTHUB_API_URL}/api/auth/me?_t=${Date.now()}`, { withCredentials: true });
            if (requestGeneration !== authGenerationRef.current) return;
            if (res.data && res.data.success) {
                setUser(res.data.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            if (requestGeneration !== authGenerationRef.current) return;
            setUser(null);
        } finally {
            if (requestGeneration === authGenerationRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginSync = (userData) => {
        authGenerationRef.current += 1;
        setUser(userData);
        setLoading(false);
    };

    const logout = async () => {
        try {
            await axios.get(`${ALTHUB_API_URL}/api/instituteLogout`, { withCredentials: true });
        } catch (err) {}
        authGenerationRef.current += 1;
        setUser(null);
        setLoading(false);
        nav('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginSync, refetchUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
