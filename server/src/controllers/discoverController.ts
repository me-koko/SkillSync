import { Request, Response } from 'express';
import prisma from '../config/database';
import { MatchingService, UserMatchProfile } from '../services/matchingService';
import { sendSuccess, sendError } from '../utils/response';
import { SkillLevel, SkillType } from '@prisma/client';

export class DiscoverController {
  static async discoverStudents(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;
      const {
        search,
        teachSkill,
        learnSkill,
        skillLevel,
        dayOfWeek,
        learningFormat,
        college,
        yearOfStudy,
      } = req.query as Record<string, string | undefined>;

      // 1. Fetch current user with their skills, interests, availability
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
        },
      });

      if (!currentUser) {
        return sendError(res, 'Current user not found', 404);
      }

      // 2. Fetch active connections and requests of the current user to display relation status
      const existingConnections = await prisma.connection.findMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
      });

      const connectionMap = new Map<string, { id: string; status: string; isSender: boolean }>();
      for (const conn of existingConnections) {
        const partnerId = conn.senderId === currentUserId ? conn.receiverId : conn.senderId;
        connectionMap.set(partnerId, {
          id: conn.id,
          status: conn.status,
          isSender: conn.senderId === currentUserId,
        });
      }

      // 3. Build Prisma where query for candidates
      const whereClause: any = {
        id: { not: currentUserId },
        privacySetting: { not: 'PRIVATE' },
      };

      // Search keyword filter
      if (search && search.trim() !== '') {
        const query = search.trim();
        whereClause.OR = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { college: { contains: query, mode: 'insensitive' } },
          { course: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
          {
            skills: {
              some: {
                skill: { name: { contains: query, mode: 'insensitive' } },
              },
            },
          },
          {
            interests: {
              some: {
                interest: { name: { contains: query, mode: 'insensitive' } },
              },
            },
          },
        ];
      }

      // Specific college filter
      if (college && college !== 'ALL') {
        whereClause.college = { contains: college, mode: 'insensitive' };
      }

      // Year filter
      if (yearOfStudy && yearOfStudy !== 'ALL') {
        whereClause.yearOfStudy = yearOfStudy;
      }

      // Learning format filter
      if (learningFormat && learningFormat !== 'ALL') {
        whereClause.learningFormat = learningFormat;
      }

      // Teach skill filter
      if (teachSkill && teachSkill !== 'ALL') {
        whereClause.skills = {
          ...whereClause.skills,
          some: {
            type: SkillType.TEACH,
            skill: { name: { equals: teachSkill, mode: 'insensitive' } },
            ...(skillLevel && skillLevel !== 'ALL' ? { level: skillLevel as SkillLevel } : {}),
          },
        };
      }

      // Learn skill filter
      if (learnSkill && learnSkill !== 'ALL') {
        whereClause.skills = {
          ...whereClause.skills,
          some: {
            type: SkillType.LEARN,
            skill: { name: { equals: learnSkill, mode: 'insensitive' } },
          },
        };
      }

      // Availability filter
      if (dayOfWeek && dayOfWeek !== 'ALL') {
        whereClause.availabilities = {
          some: {
            dayOfWeek: { equals: dayOfWeek, mode: 'insensitive' },
          },
        };
      }

      // Fetch candidates
      const candidates = await prisma.user.findMany({
        where: whereClause,
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
          _count: {
            select: {
              receivedReviews: true,
            },
          },
        },
      });

      // 4. Calculate deterministic transparent compatibility score for each candidate
      const results = candidates.map((candidate) => {
        const match = MatchingService.calculateCompatibility(
          currentUser as UserMatchProfile,
          candidate as UserMatchProfile
        );

        const connectionInfo = connectionMap.get(candidate.id) || null;

        const { passwordHash, ...safeCandidate } = candidate;

        return {
          ...safeCandidate,
          compatibility: {
            score: match.score,
            reasons: match.reasons,
            mutualSkills: match.mutualSkills,
            sharedInterests: match.sharedInterests,
            sharedAvailability: match.sharedAvailability,
            compatibleFormat: match.compatibleFormat,
          },
          connection: connectionInfo,
        };
      });

      // Sort by compatibility score descending
      results.sort((a, b) => b.compatibility.score - a.compatibility.score);

      return sendSuccess(res, results, 'Discover students loaded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to discover students', 500);
    }
  }

  static async getTopMatches(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;

      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
        },
      });

      if (!currentUser) {
        return sendError(res, 'User not found', 404);
      }

      const candidates = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          privacySetting: { not: 'PRIVATE' },
        },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
        },
        take: 15,
      });

      const matched = candidates.map((candidate) => {
        const match = MatchingService.calculateCompatibility(
          currentUser as UserMatchProfile,
          candidate as UserMatchProfile
        );
        const { passwordHash, ...safeCandidate } = candidate;
        return {
          ...safeCandidate,
          compatibility: match,
        };
      });

      matched.sort((a, b) => b.compatibility.score - a.compatibility.score);

      return sendSuccess(res, matched.slice(0, 6), 'Top matches retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch top matches', 500);
    }
  }
}
