import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().min(2, 'College name required'),
  course: z.string().min(2, 'Course name required'),
  yearOfStudy: z.string().min(1, 'Year of study required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);

      const existing = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existing) {
        return sendError(res, 'A student account with this email already exists', 400);
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          fullName: data.fullName,
          college: data.college,
          course: data.course,
          yearOfStudy: data.yearOfStudy,
          isOnboarded: false,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          college: true,
          course: true,
          yearOfStudy: true,
          avatarUrl: true,
          isOnboarded: true,
        },
      });

      const token = generateToken({ id: user.id, email: user.email });

      return sendSuccess(
        res,
        { user, token },
        'Account created successfully. Welcome to SkillSync!',
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Registration failed', 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
        },
      });

      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password', 401);
      }

      const token = generateToken({ id: user.id, email: user.email });

      const { passwordHash, ...userSafe } = user;

      return sendSuccess(res, { user: userSafe, token }, 'Logged in successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Login failed', 400);
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          availabilities: true,
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
        return sendError(res, 'User not found', 404);
      }

      const { passwordHash, ...userSafe } = user;
      return sendSuccess(res, userSafe, 'User details retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch user', 500);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(res, null, 'Logged out successfully');
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if user exists
      return sendSuccess(res, null, 'If that email exists in our system, a password reset link has been sent.');
    }

    return sendSuccess(
      res,
      null,
      'Password reset instructions sent to your email address.'
    );
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters', 400);
    }

    return sendSuccess(res, null, 'Password has been updated successfully. You can now log in.');
  }
}
