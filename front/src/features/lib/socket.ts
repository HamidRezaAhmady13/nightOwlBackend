import { io, Socket } from "socket.io-client";

export const socket: Socket = io("https://127.0.0.1:3001", {
  path: "/socket.io",
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

localStorage.debug = "socket.io-client*";

socket.on("connect", () => null);
socket.on("connection_error", (e) =>
  console.error("connection_error:", e.message, e),
);
socket.on("disconnect", (r) => null);
