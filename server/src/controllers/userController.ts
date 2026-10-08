import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { SkillLevel, SkillType } from '@prisma/client';
import { StorageService } from '../services/storageService';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          skills: {
            include: { skill: true },
          },
          interests: {
            include: { interest: true },
          },
          availabilities: true,
          receivedReviews: {
            include: {
              reviewer: {
                select: { id: true, fullName: true, avatarUrl: true, college: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          groupMemberships: {
            include: {
              group: {
                select: { id: true, name: true, topic: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: {
              sentConnections: { where: { status: 'ACCEPTED' } },
              receivedConnections: { where: { status: 'ACCEPTED' } },
              groupMemberships: true,
              receivedReviews: true,
            },
          },
        },
      });

      if (!user) {
        return sendError(res, 'Student profile not found', 404);
      }

      // Check privacy settings if not self
      if (currentUserId && currentUserId !== user.id) {
        if (user.privacySetting === 'PRIVATE') {
          return sendError(res, 'This profile is set to private', 403);
        }
        if (user.privacySetting === 'CONNECTIONS_ONLY') {
          const isConnected = await prisma.connection.findFirst({
            where: {
              OR: [
                { senderId: currentUserId, receiverId: user.id, status: 'ACCEPTED' },
                { senderId: user.id, receiverId: currentUserId, status: 'ACCEPTED' },
              ],
            },
          });
          if (!isConnected) {
            return sendError(res, 'This profile is visible only to connections', 403);
          }
        }
      }

      // Calculate average rating
      const reviews = user.receivedReviews;
      const avgRating =
        reviews.length > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
          : null;

      const { passwordHash, ...safeProfile } = user;

      return sendSuccess(
        res,
        {
          ...safeProfile,
          ratingSummary: {
            average: avgRating,
            count: reviews.length,
          },
        },
        'Profile loaded successfully'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch profile', 500);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        fullName,
        college,
        course,
        yearOfStudy,
        bio,
        headline,
        learningFormat,
        learningStyle,
        privacySetting,
        avatarUrl,
      } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName && { fullName }),
          ...(college && { college }),
          ...(course && { course }),
          ...(yearOfStudy && { yearOfStudy }),
          ...(bio !== undefined && { bio }),
          ...(headline !== undefined && { headline }),
          ...(learningFormat !== undefined && { learningFormat }),
          ...(learningStyle !== undefined && { learningStyle }),
          ...(privacySetting && { privacySetting }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
        },
      });

      const { passwordHash, ...safeUser } = updated;
      return sendSuccess(res, safeUser, 'Profile updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update profile', 500);
    }
  }

  static async completeOnboarding(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        bio,
        headline,
        avatarUrl,
        teachSkills, // [{ name: string, category?: string, level: SkillLevel }]
        learnSkills, // [{ name: string, category?: string, level: SkillLevel }]
        interests,   // string[] of interest names
        availabilities, // [{ dayOfWeek: string, timeSlot: string, preference?: string }]
        learningFormat,
        learningStyle,
      } = req.body;

      // Transaction to wipe and re-insert skills, interests, availability
      await prisma.$transaction(async (tx) => {
        // 1. Update basic profile info & mark onboarded
        await tx.user.update({
          where: { id: userId },
          data: {
            bio: bio || null,
            headline: headline || null,
            ...(avatarUrl && { avatarUrl }),
            learningFormat: learningFormat || 'One-on-one',
            learningStyle: learningStyle || 'Structured',
            isOnboarded: true,
          },
        });

        // 2. Clear old relations
        await tx.userSkill.deleteMany({ where: { userId } });
        await tx.userInterest.deleteMany({ where: { userId } });
        await tx.availability.deleteMany({ where: { userId } });

        // 3. Upsert skills and user skills
        if (Array.isArray(teachSkills)) {
          for (const item of teachSkills) {
            const skill = await tx.skill.upsert({
              where: { name: item.name.trim() },
              update: {},
              create: { name: item.name.trim(), category: item.category || 'General' },
            });
            await tx.userSkill.create({
              data: {
                userId,
                skillId: skill.id,
                type: SkillType.TEACH,
                level: (item.level as SkillLevel) || SkillLevel.INTERMEDIATE,
              },
            });
          }
        }

        if (Array.isArray(learnSkills)) {
          for (const item of learnSkills) {
            const skill = await tx.skill.upsert({
              where: { name: item.name.trim() },
              update: {},
              create: { name: item.name.trim(), category: item.category || 'General' },
            });
            await tx.userSkill.create({
              data: {
                userId,
                skillId: skill.id,
                type: SkillType.LEARN,
                level: (item.level as SkillLevel) || SkillLevel.BEGINNER,
              },
            });
          }
        }

        // 4. Upsert interests
        if (Array.isArray(interests)) {
          for (const name of interests) {
            const interest = await tx.interest.upsert({
              where: { name: name.trim() },
              update: {},
              create: { name: name.trim(), category: 'Academic/Personal' },
            });
            await tx.userInterest.create({
              data: {
                userId,
                interestId: interest.id,
              },
            });
          }
        }

        // 5. Insert availabilities
        if (Array.isArray(availabilities)) {
          for (const a of availabilities) {
            await tx.availability.create({
              data: {
                userId,
                dayOfWeek: a.dayOfWeek,
                timeSlot: a.timeSlot,
                preference: a.preference || 'ONLINE',
              },
            });
          }
        }
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
        },
      });

      const { passwordHash, ...safeUser } = updatedUser!;
      return sendSuccess(res, safeUser, 'Onboarding completed successfully!');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to complete onboarding', 500);
    }
  }

  static async uploadAvatar(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return sendError(res, 'No image file uploaded', 400);
      }

      const result = await StorageService.uploadFile(file);
      const userId = req.user!.id;

      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: result.url },
      });

      return sendSuccess(res, { url: result.url }, 'Profile picture updated');
    } catch (err: any) {
      return sendError(res, err.message || 'Avatar upload failed', 500);
    }
  }

  static async getAllSkills(req: Request, res: Response) {
    try {
      const skills = await prisma.skill.findMany({
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, skills, 'Skills list retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve skills', 500);
    }
  }

  static async getAllInterests(req: Request, res: Response) {
    try {
      const interests = await prisma.interest.findMany({
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, interests, 'Interests list retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve interests', 500);
    }
  }
}
