import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const createAuthSession = ({
  apiClient,
  mePath = '/api/auth/me',
  logoutPath,
  loginPath = '/login',
  onUserLoaded,
  onLogout,
} = {}) => {
  const AuthContext = createContext();

  const useAuth = () => useContext(AuthContext);

  const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const authGenerationRef = useRef(0);
    const nav = useNavigate();

    const fetchUser = async () => {
      const requestGeneration = authGenerationRef.current;

      try {
        const separator = mePath.includes('?') ? '&' : '?';
        const res = await apiClient.get(`${mePath}${separator}_t=${Date.now()}`);
        if (requestGeneration !== authGenerationRef.current) return;

        if (res.data?.success) {
          setUser(res.data.data);
          onUserLoaded?.(res.data.data);
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
    }, []);

    const loginSync = (userData) => {
      authGenerationRef.current += 1;
      setUser(userData);
      setLoading(false);
      onUserLoaded?.(userData);
    };

    const logout = async () => {
      try {
        await apiClient.get(logoutPath);
      } catch (err) {
        // Logout should still clear the local session if the server request fails.
      }

      authGenerationRef.current += 1;
      setUser(null);
      setLoading(false);
      onLogout?.();
      nav(loginPath);
    };

    return (
      <AuthContext.Provider value={{ user, loading, logout, loginSync, refetchUser: fetchUser }}>
        {children}
      </AuthContext.Provider>
    );
  };

  return { AuthContext, AuthProvider, useAuth };
};
