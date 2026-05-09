import { io, Socket } from "socket.io-client";

export const socket: Socket = io("http://localhost:3000", {
  path: "/socket.io",
  withCredentials: true,
  autoConnect: false,
});

localStorage.debug = "socket.io-client*";

socket.on("connect", () => console.log("socket connected", socket.id));
socket.on("connection_error", (e) =>
  console.error("connection_error:", e.message, e)
);
socket.on("disconnect", (r) => console.log("socket disconnected", r));
