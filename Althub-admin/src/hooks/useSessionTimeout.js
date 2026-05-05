/**
 * useSessionTimeout - Logs out user after period of inactivity.
 * Protects against session hijacking on shared/unattended devices.
 */
import { useAuth } from '../auth/session';
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/client';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export const useSessionTimeout = (enabled = true) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const secureLogout = useCallback(async () => {
        try {
            await axiosInstance.get('/api/v1/instituteLogout');
        } catch (err) {
            console.error("Session logout error", err);
        } finally {
            logout();
            navigate('/login', { replace: true });
        }
    }, [logout, navigate]);

    const resetTimer = useCallback(() => {
        if (!enabled) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            secureLogout();
        }, INACTIVITY_MS);
    }, [enabled, secureLogout]);

    useEffect(() => {
        if (!enabled) return;
        if (!(user?._id)) return;

        resetTimer();

        const handler = () => resetTimer();
        EVENTS.forEach((ev) => window.addEventListener(ev, handler));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            EVENTS.forEach((ev) => window.removeEventListener(ev, handler));
        };
    }, [enabled, resetTimer, user?._id]);
};
