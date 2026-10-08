import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { StorageService } from '../services/storageService';

export class ResourceController {
  static async getResources(req: Request, res: Response) {
    try {
      const { groupId, roomId } = req.query as Record<string, string | undefined>;

      const whereClause: any = {};
      if (groupId) whereClause.groupId = groupId;
      if (roomId) whereClause.roomId = roomId;

      const resources = await prisma.resource.findMany({
        where: whereClause,
        include: {
          uploader: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, resources, 'Resources retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch resources', 500);
    }
  }

  static async createLinkResource(req: Request, res: Response) {
    try {
      const uploaderId = req.user!.id;
      const { name, url, groupId, roomId } = req.body;

      if (!name || !url) {
        return sendError(res, 'Resource name and URL are required', 400);
      }

      const resource = await prisma.resource.create({
        data: {
          name: name.trim(),
          url: url.trim(),
          type: 'link',
          uploaderId,
          groupId: groupId || null,
          roomId: roomId || null,
        },
        include: {
          uploader: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      return sendSuccess(res, resource, 'Resource added', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to add resource', 500);
    }
  }

  static async uploadFileResource(req: Request, res: Response) {
    try {
      const uploaderId = req.user!.id;
      const file = req.file;
      const { name, groupId, roomId } = req.body;

      if (!file) {
        return sendError(res, 'File is required', 400);
      }

      const uploadResult = await StorageService.uploadFile(file);

      let type = 'document';
      if (uploadResult.mimetype.startsWith('image/')) type = 'image';
      else if (uploadResult.mimetype === 'application/pdf') type = 'pdf';

      const resource = await prisma.resource.create({
        data: {
          name: (name && name.trim()) || uploadResult.filename,
          url: uploadResult.url,
          type,
          size: uploadResult.size,
          uploaderId,
          groupId: groupId || null,
          roomId: roomId || null,
        },
        include: {
          uploader: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      return sendSuccess(res, resource, 'File resource uploaded', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to upload file resource', 500);
    }
  }

  static async deleteResource(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const resource = await prisma.resource.findUnique({ where: { id } });
      if (!resource) {
        return sendError(res, 'Resource not found', 404);
      }

      if (resource.uploaderId !== userId) {
        return sendError(res, 'Not authorized to delete this resource', 403);
      }

      await prisma.resource.delete({ where: { id } });

      return sendSuccess(res, null, 'Resource deleted');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete resource', 500);
    }
  }
}
