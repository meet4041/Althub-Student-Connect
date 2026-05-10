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
