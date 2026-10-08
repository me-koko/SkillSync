import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export class ReviewController {
  static async createReview(req: Request, res: Response) {
    try {
      const reviewerId = req.user!.id;
      const { exchangeId, revieweeId, rating, feedback } = req.body;

      if (!revieweeId || !rating || !feedback) {
        return sendError(res, 'Reviewee, rating, and feedback are required', 400);
      }

      if (rating < 1 || rating > 5) {
        return sendError(res, 'Rating must be between 1 and 5 stars', 400);
      }

      if (reviewerId === revieweeId) {
        return sendError(res, 'You cannot review yourself', 400);
      }

      const review = await prisma.review.create({
        data: {
          reviewerId,
          revieweeId,
          exchangeId: exchangeId || null,
          rating: Math.round(rating),
          feedback: feedback.trim(),
        },
        include: {
          reviewer: { select: { id: true, fullName: true, avatarUrl: true, college: true } },
        },
      });

      return sendSuccess(res, review, 'Review submitted successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to submit review', 500);
    }
  }

  static async getReviewsForUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const reviews = await prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: { select: { id: true, fullName: true, avatarUrl: true, college: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const avgRating =
        reviews.length > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
          : null;

      return sendSuccess(res, { reviews, averageRating: avgRating, count: reviews.length }, 'Reviews retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch reviews', 500);
    }
  }
}
