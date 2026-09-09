"use client";
import { useEffect } from "react";
import { useSocket } from "./SocketProvider";

export default function Notifs() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const onNew = (p: any) => null;
    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew); // wrapped in block so cleanup returns void
    };
  }, [socket]);
  return null;
}
