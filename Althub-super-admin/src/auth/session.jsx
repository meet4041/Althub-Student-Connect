import { createAuthSession } from '@althub/shared/auth';
import apiClient from '../api/client';

const authSession = createAuthSession({
    apiClient,
    mePath: '/api/v1/auth/super-admin/me',
    logoutPath: '/api/v1/adminLogout',
});

export const AuthContext = authSession.AuthContext;
export const AuthProvider = authSession.AuthProvider;
export const useAuth = authSession.useAuth;
