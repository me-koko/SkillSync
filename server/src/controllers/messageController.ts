import { Request, Response } from 'express';
import prisma from '../config/database';
import { NotificationType } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { NotificationService } from '../services/notificationService';
import { getSocketIO } from '../socket/socketManager';

export class MessageController {
  static async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Find all connected users
      const connections = await prisma.connection.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
        },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true, college: true },
          },
          receiver: {
            select: { id: true, fullName: true, avatarUrl: true, college: true },
          },
        },
      });

      // Get last message for each peer
      const peerList = connections.map((conn) =>
        conn.senderId === userId ? conn.receiver : conn.sender
      );

      const conversationSummaries = await Promise.all(
        peerList.map(async (peer) => {
          const lastMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: peer.id },
                { senderId: peer.id, receiverId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const unreadCount = await prisma.message.count({
            where: {
              senderId: peer.id,
              receiverId: userId,
              isRead: false,
            },
          });

          return {
            peer,
            lastMessage,
            unreadCount,
          };
        })
      );

      // Sort by last message date descending
      conversationSummaries.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return sendSuccess(res, conversationSummaries, 'Conversations retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch conversations', 500);
    }
  }

  static async getDirectMessages(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { peerId } = req.params;

      // Mark unread messages from this peer as read
      await prisma.message.updateMany({
        where: {
          senderId: peerId,
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: peerId },
            { senderId: peerId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      return sendSuccess(res, messages, 'Messages retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch messages', 500);
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const senderId = req.user!.id;
      const { receiverId, groupId, roomId, content } = req.body;

      if (!content || !content.trim()) {
        return sendError(res, 'Message content cannot be empty', 400);
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId: receiverId || null,
          groupId: groupId || null,
          roomId: roomId || null,
          content: content.trim(),
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      const io = getSocketIO();
      if (io) {
        if (receiverId) {
          // Direct message: emit to receiver and sender personal rooms
          io.to(`user:${receiverId}`).emit('chat:message', message);
          io.to(`user:${senderId}`).emit('chat:message', message);

          // Notification to receiver
          await NotificationService.send({
            userId: receiverId,
            type: NotificationType.NEW_MESSAGE,
            title: `New message from ${message.sender.fullName}`,
            message: content.length > 60 ? content.slice(0, 60) + '...' : content,
            link: `/messages/${senderId}`,
          });
        } else if (groupId) {
          io.to(`group:${groupId}`).emit('group:message', message);
        } else if (roomId) {
          io.to(`room:${roomId}`).emit('room:message', message);
        }
      }

      return sendSuccess(res, message, 'Message sent', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to send message', 500);
    }
  }
}
