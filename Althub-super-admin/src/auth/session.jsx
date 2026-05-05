import { createAuthSession } from '@althub/shared/auth';
import apiClient from '../api/client';

const authSession = createAuthSession({
    apiClient,
    mePath: '/api/auth/super-admin/me',
    logoutPath: '/api/adminLogout',
});

export const AuthContext = authSession.AuthContext;
export const AuthProvider = authSession.AuthProvider;
export const useAuth = authSession.useAuth;
