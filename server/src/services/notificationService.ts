import prisma from '../config/database';
import { NotificationType } from '@prisma/client';
import { getSocketIO } from '../socket/socketManager';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export class NotificationService {
  static async send(params: CreateNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          link: params.link,
        },
      });

      // Emit via socket if online
      const io = getSocketIO();
      if (io) {
        io.to(`user:${params.userId}`).emit('notification:new', notification);
      }

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }
}
