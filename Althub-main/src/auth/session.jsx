import { createAuthSession } from '@althub/shared/auth';
import apiClient from '../api/client';
import { socket } from '../realtime/socket';

const syncSocketUser = (userData) => {
    if (!userData?._id) return;
    if (!socket.connected) socket.connect();
    socket.emit('addUser', userData._id);
};

const authSession = createAuthSession({
    apiClient,
    // Use legacy /api paths so this works against the currently-deployed backend
    // (which doesn't have /api/v1 mount yet). Both old and new backends serve
    // /api/auth/me and /api/userLogout.
    mePath: '/api/auth/me',
    logoutPath: '/api/userLogout',
    onUserLoaded: syncSocketUser,
    onLogout: () => {
        if (socket.connected) socket.disconnect();
    },
});

export const AuthContext = authSession.AuthContext;
export const AuthProvider = authSession.AuthProvider;
export const useAuth = authSession.useAuth;
