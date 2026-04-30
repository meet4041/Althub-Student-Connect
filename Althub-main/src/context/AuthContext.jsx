import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    const fetchUser = async () => {
        try {
            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${apiBase}/api/auth/me?_t=${Date.now()}`, { withCredentials: true });
            if (res.data && res.data.success) {
                setUser(res.data.data);
                if (!socket.connected) socket.connect();
                socket.emit('addUser', res.data.data._id);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginSync = (userData) => {
        setUser(userData);
        if (!socket.connected) socket.connect();
        socket.emit('addUser', userData._id);
    };

    const logout = async () => {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        try {
            await axios.get(`${apiBase}/api/userLogout`, { withCredentials: true });
        } catch (err) {}
        setUser(null);
        if (socket.connected) socket.disconnect();
        nav('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginSync, refetchUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
