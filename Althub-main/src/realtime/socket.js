import { io } from "socket.io-client";
import { WEB_URL } from "../config/api";

export const socket = io(WEB_URL, {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
