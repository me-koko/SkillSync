import { Request, Response } from 'express';
import prisma from '../config/database';
import { TaskPriority, TaskStatus, NotificationType } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { NotificationService } from '../services/notificationService';
import { getSocketIO } from '../socket/socketManager';

export class TaskController {
  static async getTasks(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId, roomId, status, priority, scope } = req.query as Record<string, string | undefined>;

      const whereClause: any = {};

      if (groupId) {
        whereClause.groupId = groupId;
      } else if (roomId) {
        whereClause.roomId = roomId;
      } else if (scope === 'personal') {
        whereClause.AND = [
          { OR: [{ creatorId: userId }, { assigneeId: userId }] },
          { groupId: null },
          { roomId: null },
        ];
      } else {
        // All tasks relevant to user
        whereClause.OR = [
          { creatorId: userId },
          { assigneeId: userId },
          { group: { members: { some: { userId } } } },
          { room: { members: { some: { userId } } } },
        ];
      }

      if (status && status !== 'ALL') {
        whereClause.status = status as TaskStatus;
      }

      if (priority && priority !== 'ALL') {
        whereClause.priority = priority as TaskPriority;
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          creator: { select: { id: true, fullName: true, avatarUrl: true } },
          assignee: { select: { id: true, fullName: true, avatarUrl: true } },
          group: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      });

      return sendSuccess(res, tasks, 'Tasks retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch tasks', 500);
    }
  }

  static async createTask(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const { title, description, dueDate, priority, status, assigneeId, groupId, roomId } = req.body;

      if (!title || !title.trim()) {
        return sendError(res, 'Task title is required', 400);
      }

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: (priority as TaskPriority) || TaskPriority.MEDIUM,
          status: (status as TaskStatus) || TaskStatus.TODO,
          creatorId,
          assigneeId: assigneeId || null,
          groupId: groupId || null,
          roomId: roomId || null,
        },
        include: {
          creator: { select: { id: true, fullName: true, avatarUrl: true } },
          assignee: { select: { id: true, fullName: true, avatarUrl: true } },
          group: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
        },
      });

      // Send notification if assigned to another user
      if (assigneeId && assigneeId !== creatorId) {
        await NotificationService.send({
          userId: assigneeId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: `${task.creator.fullName} assigned you a task: "${task.title}"`,
          link: '/tasks',
        });
      }

      // If created inside a room or group, broadcast via socket
      const io = getSocketIO();
      if (io) {
        if (roomId) {
          io.to(`room:${roomId}`).emit('room:task_updated', { roomId, task, action: 'create' });
        }
        if (groupId) {
          io.to(`group:${groupId}`).emit('group:task_updated', { groupId, task, action: 'create' });
        }
      }

      return sendSuccess(res, task, 'Task created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create task', 500);
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, dueDate, priority, status, assigneeId } = req.body;

      const task = await prisma.task.update({
        where: { id },
        data: {
          ...(title && { title: title.trim() }),
          ...(description !== undefined && { description }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(priority && { priority: priority as TaskPriority }),
          ...(status && { status: status as TaskStatus }),
          ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        },
        include: {
          creator: { select: { id: true, fullName: true, avatarUrl: true } },
          assignee: { select: { id: true, fullName: true, avatarUrl: true } },
          group: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
        },
      });

      // Broadcast update
      const io = getSocketIO();
      if (io) {
        if (task.roomId) {
          io.to(`room:${task.roomId}`).emit('room:task_updated', { roomId: task.roomId, task, action: 'update' });
        }
        if (task.groupId) {
          io.to(`group:${task.groupId}`).emit('group:task_updated', { groupId: task.groupId, task, action: 'update' });
        }
      }

      return sendSuccess(res, task, 'Task updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update task', 500);
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await prisma.task.delete({ where: { id } });

      const io = getSocketIO();
      if (io) {
        if (task.roomId) {
          io.to(`room:${task.roomId}`).emit('room:task_updated', { roomId: task.roomId, taskId: id, action: 'delete' });
        }
      }

      return sendSuccess(res, null, 'Task deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete task', 500);
    }
  }
}
