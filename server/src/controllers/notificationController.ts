import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 40,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch notifications', 500);
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const notification = await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });

      return sendSuccess(res, notification, 'Notification marked as read');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update notification', 500);
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to mark all as read', 500);
    }
  }
}
