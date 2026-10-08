import { Request, Response } from 'express';
import prisma from '../config/database';
import { ExchangeStatus, NotificationType } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { NotificationService } from '../services/notificationService';

export class ExchangeController {
  static async getExchanges(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const exchanges = await prisma.skillExchange.findMany({
        where: {
          OR: [{ initiatorId: userId }, { partnerId: userId }],
        },
        include: {
          initiator: {
            select: { id: true, fullName: true, avatarUrl: true, college: true, course: true },
          },
          partner: {
            select: { id: true, fullName: true, avatarUrl: true, college: true, course: true },
          },
          reviews: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return sendSuccess(res, exchanges, 'Exchanges retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch exchanges', 500);
    }
  }

  static async getExchangeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const exchange = await prisma.skillExchange.findUnique({
        where: { id },
        include: {
          initiator: {
            select: { id: true, fullName: true, avatarUrl: true, college: true, course: true },
          },
          partner: {
            select: { id: true, fullName: true, avatarUrl: true, college: true, course: true },
          },
          reviews: {
            include: {
              reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      if (!exchange) {
        return sendError(res, 'Exchange agreement not found', 404);
      }

      if (exchange.initiatorId !== userId && exchange.partnerId !== userId) {
        return sendError(res, 'Not authorized to view this exchange', 403);
      }

      return sendSuccess(res, exchange, 'Exchange agreement details');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch exchange', 500);
    }
  }

  static async createExchange(req: Request, res: Response) {
    try {
      const initiatorId = req.user!.id;
      const { partnerId, teachSkill, learnSkill, schedule, format, notes } = req.body;

      if (!partnerId || !teachSkill || !learnSkill || !schedule) {
        return sendError(res, 'Partner, skills, and schedule are required', 400);
      }

      // Ensure they are connected
      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: initiatorId, receiverId: partnerId, status: 'ACCEPTED' },
            { senderId: partnerId, receiverId: initiatorId, status: 'ACCEPTED' },
          ],
        },
      });

      if (!connection) {
        return sendError(res, 'You can only create skill exchanges with accepted connections', 400);
      }

      const exchange = await prisma.skillExchange.create({
        data: {
          initiatorId,
          partnerId,
          teachSkill,
          learnSkill,
          schedule,
          format: format || 'Online',
          status: ExchangeStatus.PROPOSED,
          notes,
        },
        include: {
          initiator: { select: { fullName: true } },
        },
      });

      // Send real-time notification
      await NotificationService.send({
        userId: partnerId,
        type: NotificationType.EXCHANGE_PROPOSAL,
        title: 'New Skill Exchange Proposal',
        message: `${exchange.initiator.fullName} proposed a skill exchange: ${teachSkill} for ${learnSkill}.`,
        link: '/exchanges',
      });

      return sendSuccess(res, exchange, 'Skill exchange proposal created', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create exchange', 500);
    }
  }

  static async updateExchangeStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status, schedule, format, notes } = req.body;

      const exchange = await prisma.skillExchange.findUnique({
        where: { id },
        include: {
          initiator: { select: { id: true, fullName: true } },
          partner: { select: { id: true, fullName: true } },
        },
      });

      if (!exchange) {
        return sendError(res, 'Exchange agreement not found', 404);
      }

      if (exchange.initiatorId !== userId && exchange.partnerId !== userId) {
        return sendError(res, 'Not authorized to modify this exchange', 403);
      }

      const updated = await prisma.skillExchange.update({
        where: { id },
        data: {
          ...(status && { status: status as ExchangeStatus }),
          ...(schedule && { schedule }),
          ...(format && { format }),
          ...(notes !== undefined && { notes }),
        },
      });

      // Notify the other peer
      const notifyUserId = exchange.initiatorId === userId ? exchange.partnerId : exchange.initiatorId;
      const updaterName = exchange.initiatorId === userId ? exchange.initiator.fullName : exchange.partner.fullName;

      if (status === ExchangeStatus.ACTIVE) {
        await NotificationService.send({
          userId: notifyUserId,
          type: NotificationType.EXCHANGE_ACCEPTED,
          title: 'Skill Exchange Accepted!',
          message: `${updaterName} accepted your skill exchange agreement. Time to learn!`,
          link: '/exchanges',
        });
      } else if (status === ExchangeStatus.COMPLETED) {
        await NotificationService.send({
          userId: notifyUserId,
          type: NotificationType.EXCHANGE_COMPLETED,
          title: 'Skill Exchange Completed!',
          message: `${updaterName} marked your skill exchange as completed. Leave a review!`,
          link: '/exchanges',
        });
      }

      return sendSuccess(res, updated, 'Exchange updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update exchange', 500);
    }
  }
}
