import { createAuthSession } from '@althub/shared/auth';
import apiClient from '../api/client';

const authSession = createAuthSession({
    apiClient,
    // Use legacy paths until backend deploys v1 mount. See main/auth/session.jsx.
    mePath: '/api/auth/me',
    logoutPath: '/api/instituteLogout',
});

export const AuthContext = authSession.AuthContext;
export const AuthProvider = authSession.AuthProvider;
export const useAuth = authSession.useAuth;
