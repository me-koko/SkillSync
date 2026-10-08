import { Request, Response } from 'express';
import prisma from '../config/database';
import { ConnectionStatus, NotificationType } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { NotificationService } from '../services/notificationService';

export class ConnectionController {
  static async getConnections(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Accepted connections
      const accepted = await prisma.connection.findMany({
        where: {
          OR: [
            { senderId: userId, status: ConnectionStatus.ACCEPTED },
            { receiverId: userId, status: ConnectionStatus.ACCEPTED },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              college: true,
              course: true,
              yearOfStudy: true,
              headline: true,
              skills: { include: { skill: true } },
            },
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              college: true,
              course: true,
              yearOfStudy: true,
              headline: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Format connected peer
      const currentConnections = accepted.map((conn) => {
        const peer = conn.senderId === userId ? conn.receiver : conn.sender;
        return {
          connectionId: conn.id,
          connectedSince: conn.updatedAt,
          peer,
        };
      });

      // Incoming pending requests
      const incoming = await prisma.connection.findMany({
        where: {
          receiverId: userId,
          status: ConnectionStatus.PENDING,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              college: true,
              course: true,
              yearOfStudy: true,
              headline: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Sent pending requests
      const sent = await prisma.connection.findMany({
        where: {
          senderId: userId,
          status: ConnectionStatus.PENDING,
        },
        include: {
          receiver: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              college: true,
              course: true,
              yearOfStudy: true,
              headline: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(
        res,
        {
          current: currentConnections,
          incoming,
          sent,
        },
        'Connections loaded'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch connections', 500);
    }
  }

  static async sendRequest(req: Request, res: Response) {
    try {
      const senderId = req.user!.id;
      const { receiverId } = req.body;

      if (!receiverId || receiverId === senderId) {
        return sendError(res, 'Invalid recipient user', 400);
      }

      // Check existing connection
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
      });

      if (existing) {
        if (existing.status === ConnectionStatus.ACCEPTED) {
          return sendError(res, 'You are already connected with this student', 400);
        }
        if (existing.status === ConnectionStatus.PENDING) {
          return sendError(res, 'A connection request is already pending', 400);
        }
        if (existing.status === ConnectionStatus.BLOCKED) {
          return sendError(res, 'Cannot connect with this user', 403);
        }
      }

      const connection = await prisma.connection.create({
        data: {
          senderId,
          receiverId,
          status: ConnectionStatus.PENDING,
        },
        include: {
          sender: { select: { fullName: true } },
        },
      });

      // Send real-time notification to receiver
      await NotificationService.send({
        userId: receiverId,
        type: NotificationType.CONNECTION_REQUEST,
        title: 'New Connection Request',
        message: `${connection.sender.fullName} sent you a connection request.`,
        link: '/connections',
      });

      return sendSuccess(res, connection, 'Connection request sent successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to send connection request', 500);
    }
  }

  static async respondRequest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body; // ACCEPTED or REJECTED

      if (![ConnectionStatus.ACCEPTED, ConnectionStatus.REJECTED, ConnectionStatus.BLOCKED].includes(status)) {
        return sendError(res, 'Invalid connection status', 400);
      }

      const connection = await prisma.connection.findUnique({
        where: { id },
        include: {
          receiver: { select: { fullName: true } },
          sender: { select: { fullName: true } },
        },
      });

      if (!connection) {
        return sendError(res, 'Connection request not found', 404);
      }

      if (connection.receiverId !== userId && connection.senderId !== userId) {
        return sendError(res, 'Not authorized to respond to this request', 403);
      }

      const updated = await prisma.connection.update({
        where: { id },
        data: { status },
      });

      if (status === ConnectionStatus.ACCEPTED) {
        // Notify original sender
        await NotificationService.send({
          userId: connection.senderId,
          type: NotificationType.CONNECTION_ACCEPTED,
          title: 'Connection Accepted',
          message: `${connection.receiver.fullName} accepted your connection request. Start exchanging skills!`,
          link: '/connections',
        });
      }

      return sendSuccess(res, updated, `Connection ${status.toLowerCase()} successfully`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update connection', 500);
    }
  }

  static async removeConnection(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const connection = await prisma.connection.findUnique({
        where: { id },
      });

      if (!connection) {
        return sendError(res, 'Connection not found', 404);
      }

      if (connection.senderId !== userId && connection.receiverId !== userId) {
        return sendError(res, 'Not authorized to remove this connection', 403);
      }

      await prisma.connection.delete({ where: { id } });

      return sendSuccess(res, null, 'Connection removed successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to remove connection', 500);
    }
  }
}
