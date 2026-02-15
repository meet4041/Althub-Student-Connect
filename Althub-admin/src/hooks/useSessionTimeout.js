/**
 * useSessionTimeout - Logs out user after period of inactivity.
 * Protects against session hijacking on shared/unattended devices.
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../service/axios';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

const secureLogout = async (navigate) => {
    try {
        await axiosInstance.get('/api/instituteLogout');
    } catch (err) {
        console.error("Session logout error", err);
    } finally {
        localStorage.removeItem('userDetails');
        localStorage.removeItem('userRole');
        localStorage.removeItem('AlmaPlus_institute_Id');
        localStorage.removeItem('AlmaPlus_institute_Name');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    }
};

export const useSessionTimeout = (enabled = true) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);
    const savedCallback = useRef(secureLogout);

    useEffect(() => {
        savedCallback.current = () => secureLogout(navigate);
    }, [navigate]);

    const resetTimer = useCallback(() => {
        if (!enabled) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            savedCallback.current();
        }, INACTIVITY_MS);
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;
        if (!localStorage.getItem('AlmaPlus_institute_Id')) return;

        resetTimer();

        const handler = () => resetTimer();
        EVENTS.forEach((ev) => window.addEventListener(ev, handler));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            EVENTS.forEach((ev) => window.removeEventListener(ev, handler));
        };
    }, [enabled, resetTimer]);
};
