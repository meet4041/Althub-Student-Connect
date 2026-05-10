import { createAuthSession } from '@althub/shared/auth';
import apiClient from '../api/client';

const authSession = createAuthSession({
    apiClient,
    mePath: '/api/auth/me',
    logoutPath: '/api/instituteLogout',
});

export const AuthContext = authSession.AuthContext;
export const AuthProvider = authSession.AuthProvider;
export const useAuth = authSession.useAuth;
