import { io } from "socket.io-client";
import { WEB_URL } from "./baseURL"; // Ensure this points to your server URL (http://localhost:5001)

// Initialize socket only once
export const socket = io(WEB_URL, {
  withCredentials: true,
  transports: ["websocket"], // Force WebSocket to avoid polling errors
  autoConnect: false,        // Wait until we manually call connect()
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});