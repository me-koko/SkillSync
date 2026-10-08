import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { getSocketIO } from '../socket/socketManager';

export class RoomController {
  static async getRooms(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { search, topic } = req.query as Record<string, string | undefined>;

      const whereClause: any = {
        OR: [
          { isPrivate: false },
          { members: { some: { userId } } },
          { creatorId: userId },
        ],
      };

      if (search && search.trim()) {
        whereClause.AND = [
          {
            OR: [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { topic: { contains: search.trim(), mode: 'insensitive' } },
            ],
          },
        ];
      }

      if (topic && topic !== 'ALL') {
        whereClause.topic = { contains: topic, mode: 'insensitive' };
      }

      const rooms = await prisma.studyRoom.findMany({
        where: whereClause,
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
              messages: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return sendSuccess(res, rooms, 'Study rooms loaded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch rooms', 500);
    }
  }

  static async getRoomById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const room = await prisma.studyRoom.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true, college: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true, college: true, headline: true },
              },
            },
          },
          tasks: {
            include: {
              assignee: { select: { id: true, fullName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          resources: {
            include: {
              uploader: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          messages: {
            take: 60,
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      if (!room) {
        return sendError(res, 'Study room not found', 404);
      }

      const isMember = room.members.some((m) => m.userId === userId) || room.creatorId === userId;

      return sendSuccess(res, { ...room, isMember }, 'Study room details loaded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch study room', 500);
    }
  }

  static async createRoom(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const { name, topic, isPrivate, sharedNotes } = req.body;

      if (!name || !topic) {
        return sendError(res, 'Room name and topic are required', 400);
      }

      const room = await prisma.studyRoom.create({
        data: {
          name,
          topic,
          creatorId,
          isPrivate: !!isPrivate,
          sharedNotes: sharedNotes || `# ${name}\nTopic: ${topic}\n\nCollaborative notes for our session. Feel free to type!`,
          members: {
            create: {
              userId: creatorId,
            },
          },
        },
        include: {
          creator: { select: { id: true, fullName: true } },
          members: true,
        },
      });

      return sendSuccess(res, room, 'Study room created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create room', 500);
    }
  }

  static async joinRoom(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const room = await prisma.studyRoom.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!room) {
        return sendError(res, 'Study room not found', 404);
      }

      const isMember = room.members.some((m) => m.userId === userId);
      if (!isMember) {
        await prisma.roomMember.create({
          data: {
            roomId: id,
            userId,
          },
        });
      }

      return sendSuccess(res, null, 'Joined study room');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to join study room', 500);
    }
  }

  static async updateNotes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sharedNotes } = req.body;

      const room = await prisma.studyRoom.update({
        where: { id },
        data: { sharedNotes },
      });

      return sendSuccess(res, { sharedNotes: room.sharedNotes }, 'Notes updated');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update notes', 500);
    }
  }

  static async updateTimer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { activeTimer, isTimerOn } = req.body;

      const room = await prisma.studyRoom.update({
        where: { id },
        data: {
          ...(activeTimer !== undefined && { activeTimer }),
          ...(isTimerOn !== undefined && { isTimerOn }),
        },
      });

      return sendSuccess(res, room, 'Room timer updated');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update timer', 500);
    }
  }
}
