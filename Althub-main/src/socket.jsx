import React, { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";

// Import the URL you defined in your baseURL file
import { WEB_URL } from "../jsx/pages/baseURL"; 

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // 1. Get the token safely from storage
    const token = localStorage.getItem("token") || localStorage.getItem("institute_token");

    useEffect(() => {
        if (token) {
            // [CRITICAL FIX] Pass WEB_URL (http://localhost:5001) as the first argument
            const newSocket = io(WEB_URL, {
                auth: {
                    token: token, // Send token in auth object (standard practice)
                },
                query: {
                    token: token, // Some backends look here
                },
                transports: ["websocket"], // Prevent polling errors
            });

            setSocket(newSocket);

            // Listen for events (Example)
            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            // Cleanup on unmount
            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};