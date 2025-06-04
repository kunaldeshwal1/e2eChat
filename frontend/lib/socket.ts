"use client";
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

import { io } from "socket.io-client";
export const socket = io(`${serverUrl}`, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});
