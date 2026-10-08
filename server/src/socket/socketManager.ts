import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';

let ioInstance: SocketIOServer | null = null;

// Map user ID -> Set of socket IDs
const onlineUsers = new Map<string, Set<string>>();

export const initializeSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  // Authentication middleware for Socket.IO
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication required for socket'));
    }

    try {
      const decoded = verifyToken(token as string);
      (socket as any).userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    if (!userId) return;

    // Register online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Join personal room for private notifications and direct messages
    socket.join(`user:${userId}`);

    // Broadcast online status
    io.emit('user:status', { userId, status: 'online' });

    // Send current online user IDs to the newly connected client
    const currentOnlineIds = Array.from(onlineUsers.keys());
    socket.emit('users:online_list', currentOnlineIds);

    // Join Study Group Channel
    socket.on('group:join', (groupId: string) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('group:leave', (groupId: string) => {
      socket.leave(`group:${groupId}`);
    });

    // Join Study Room Channel
    socket.on('room:join', async (roomId: string) => {
      socket.join(`room:${roomId}`);
      io.to(`room:${roomId}`).emit('room:participant_joined', { userId, socketId: socket.id });
    });

    socket.on('room:leave', (roomId: string) => {
      socket.leave(`room:${roomId}`);
      io.to(`room:${roomId}`).emit('room:participant_left', { userId, socketId: socket.id });
    });

    // Typing indicators
    socket.on('chat:typing', (data: { recipientId?: string; groupId?: string; roomId?: string; isTyping: boolean; userName: string }) => {
      if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit('chat:typing', {
          senderId: userId,
          userName: data.userName,
          isTyping: data.isTyping,
        });
      } else if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit('chat:typing', {
          groupId: data.groupId,
          senderId: userId,
          userName: data.userName,
          isTyping: data.isTyping,
        });
      } else if (data.roomId) {
        socket.to(`room:${data.roomId}`).emit('chat:typing', {
          roomId: data.roomId,
          senderId: userId,
          userName: data.userName,
          isTyping: data.isTyping,
        });
      }
    });

    // Study Room Real-Time Collaboration: Pomodoro Timer Sync
    socket.on('room:timer_sync', (data: { roomId: string; activeTimer: number; isTimerOn: boolean }) => {
      socket.to(`room:${data.roomId}`).emit('room:timer_sync', data);
    });

    // Study Room Real-Time Collaboration: Shared Notes Sync
    socket.on('room:notes_sync', (data: { roomId: string; notes: string; updatedBy: string }) => {
      socket.to(`room:${data.roomId}`).emit('room:notes_sync', data);
    });

    // Study Room Real-Time Collaboration: Task status sync
    socket.on('room:task_updated', (data: { roomId: string; task: any }) => {
      socket.to(`room:${data.roomId}`).emit('room:task_updated', data);
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user:status', { userId, status: 'offline' });
        }
      }
    });
  });

  return io;
};

export const getSocketIO = (): SocketIOServer | null => ioInstance;

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
};
