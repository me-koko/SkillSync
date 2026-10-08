import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Notification, Message } from '../types';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  isOnline: (userId: string) => boolean;
  latestNotification: Notification | null;
  latestMessage: Message | null;
  unreadCountIncrement: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [unreadCountIncrement, setUnreadCountIncrement] = useState<number>(0);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      // connected
    });

    newSocket.on('users:online_list', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    newSocket.on('user:status', (data: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === 'online') {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    newSocket.on('notification:new', (notification: Notification) => {
      setLatestNotification(notification);
      setUnreadCountIncrement((c) => c + 1);
    });

    newSocket.on('chat:message', (message: Message) => {
      setLatestMessage(message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  const isOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isOnline,
        latestNotification,
        latestMessage,
        unreadCountIncrement,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
