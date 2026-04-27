import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000", {
        withCredentials: true,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"],
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("[Socket] Connected — id:", socket.id);
        setIsConnected(true);
      });

      socket.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected — reason:", reason);
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("[Socket] Connection error:", err.message);
        setIsConnected(false);
      });

      socket.on("reconnect", (attempt) => {
        console.log("[Socket] Reconnected after", attempt, "attempt(s)");
      });

      socket.on("reconnect_failed", () => {
        console.error("[Socket] Reconnection failed after max attempts");
      });
    }

    return () => {
      // Intentionally keep the socket alive across renders;
      // cleanup happens in the user-effect below.
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (user) {
      if (!socket.connected) {
        console.log("[Socket] User authenticated — connecting socket");
        socket.connect();
      }
    } else {
      if (socket.connected) {
        console.log("[Socket] User signed out — disconnecting socket");
        socket.disconnect();
      }
    }
  }, [user]);

  // Cleanup on full unmount (app teardown)
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
