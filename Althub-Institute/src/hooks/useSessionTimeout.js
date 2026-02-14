/**
 * useSessionTimeout - Logs out user after period of inactivity.
 * Protects against session hijacking on shared/unattended devices.
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

const secureLogout = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userRole');
    localStorage.removeItem('AlmaPlus_institute_Id');
    localStorage.removeItem('AlmaPlus_institute_Name');
    navigate('/login', { replace: true });
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
        if (!localStorage.getItem('token')) return;

        resetTimer();

        const handler = () => resetTimer();
        EVENTS.forEach((ev) => window.addEventListener(ev, handler));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            EVENTS.forEach((ev) => window.removeEventListener(ev, handler));
        };
    }, [enabled, resetTimer]);
};
