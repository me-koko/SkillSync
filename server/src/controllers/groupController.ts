import { Request, Response } from 'express';
import prisma from '../config/database';
import { GroupRole, NotificationType } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { NotificationService } from '../services/notificationService';

export class GroupController {
  static async getGroups(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { search, topic, filter } = req.query as Record<string, string | undefined>;

      const whereClause: any = {};

      if (search && search.trim()) {
        whereClause.OR = [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
          { topic: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }

      if (topic && topic !== 'ALL') {
        whereClause.topic = { contains: topic, mode: 'insensitive' };
      }

      // Filter: "my_groups" vs "all"
      if (filter === 'my_groups') {
        whereClause.members = {
          some: { userId },
        };
      } else {
        // Public groups or private where user is a member
        whereClause.OR = [
          { isPrivate: false },
          { members: { some: { userId } } },
        ];
      }

      const groups = await prisma.studyGroup.findMany({
        where: whereClause,
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true, college: true },
              },
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
              resources: true,
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, groups, 'Study groups loaded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch study groups', 500);
    }
  }

  static async getGroupById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const group = await prisma.studyGroup.findUnique({
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
            orderBy: { joinedAt: 'asc' },
          },
          tasks: {
            include: {
              assignee: { select: { id: true, fullName: true, avatarUrl: true } },
              creator: { select: { id: true, fullName: true } },
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
            take: 50,
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      if (!group) {
        return sendError(res, 'Study group not found', 404);
      }

      // Check membership if private
      const isMember = group.members.some((m) => m.userId === userId);
      if (group.isPrivate && !isMember) {
        return sendError(res, 'This group is private. You must be an invited member to access it.', 403);
      }

      return sendSuccess(res, { ...group, isMember }, 'Study group details loaded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch group', 500);
    }
  }

  static async createGroup(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const { name, description, topic, isPrivate, avatarUrl } = req.body;

      if (!name || !description || !topic) {
        return sendError(res, 'Name, description, and topic are required', 400);
      }

      const group = await prisma.studyGroup.create({
        data: {
          name,
          description,
          topic,
          creatorId,
          isPrivate: !!isPrivate,
          avatarUrl: avatarUrl || null,
          members: {
            create: {
              userId: creatorId,
              role: GroupRole.OWNER,
            },
          },
        },
        include: {
          creator: { select: { id: true, fullName: true } },
          members: true,
        },
      });

      return sendSuccess(res, group, 'Study group created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create group', 500);
    }
  }

  static async joinGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const group = await prisma.studyGroup.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!group) {
        return sendError(res, 'Group not found', 404);
      }

      const alreadyMember = group.members.some((m) => m.userId === userId);
      if (alreadyMember) {
        return sendError(res, 'You are already a member of this study group', 400);
      }

      if (group.isPrivate) {
        return sendError(res, 'This group is private and requires an invitation to join', 403);
      }

      const membership = await prisma.groupMember.create({
        data: {
          groupId: id,
          userId,
          role: GroupRole.MEMBER,
        },
      });

      return sendSuccess(res, membership, 'Joined group successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to join group', 500);
    }
  }

  static async leaveGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId: id, userId },
        },
      });

      if (!membership) {
        return sendError(res, 'You are not a member of this group', 400);
      }

      if (membership.role === GroupRole.OWNER) {
        return sendError(res, 'Group owners cannot leave. You can transfer ownership or delete the group.', 400);
      }

      await prisma.groupMember.delete({
        where: {
          groupId_userId: { groupId: id, userId },
        },
      });

      return sendSuccess(res, null, 'Left group successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to leave group', 500);
    }
  }

  static async updateMemberRole(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;
      const { id } = req.params;
      const { targetUserId, role } = req.body;

      if (![GroupRole.MODERATOR, GroupRole.MEMBER].includes(role)) {
        return sendError(res, 'Invalid group role', 400);
      }

      // Check current user is OWNER
      const myMembership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: currentUserId } },
      });

      if (!myMembership || myMembership.role !== GroupRole.OWNER) {
        return sendError(res, 'Only the group owner can assign roles', 403);
      }

      const updated = await prisma.groupMember.update({
        where: { groupId_userId: { groupId: id, userId: targetUserId } },
        data: { role },
      });

      return sendSuccess(res, updated, 'Member role updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update member role', 500);
    }
  }

  static async removeMember(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;
      const { id, memberId } = req.params;

      const myMembership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: currentUserId } },
      });

      if (!myMembership || (myMembership.role !== GroupRole.OWNER && myMembership.role !== GroupRole.MODERATOR)) {
        return sendError(res, 'Only owners and moderators can remove members', 403);
      }

      await prisma.groupMember.delete({
        where: { groupId_userId: { groupId: id, userId: memberId } },
      });

      return sendSuccess(res, null, 'Member removed from group');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to remove member', 500);
    }
  }
}
