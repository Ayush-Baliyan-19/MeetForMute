"use client"
import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        // Clean up function for disconnecting socket when unmounting
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleConnectError = async (err) => {
            console.log("Connection Error:", err);
            // Handle the error or attempt reconnection here
            await fetch("/api/socket");
        };

        
        if (socket) {
            socket.on("connect_error", handleConnectError);
        }

        return () => {
            if (socket) {
                socket.off("connect_error", handleConnectError);
            }
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{socket,userName,setUserName}}>
            {children}
        </SocketContext.Provider>
    );
}