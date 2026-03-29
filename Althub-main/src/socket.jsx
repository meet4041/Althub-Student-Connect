import { io } from "socket.io-client";
import { WEB_URL } from "./baseURL";

// Initialize socket only once
export const socket = io(WEB_URL, {
  withCredentials: true,
  transports: ["websocket"], // Force WebSocket to avoid polling errors
  autoConnect: false,        // Wait until we manually call connect()
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
