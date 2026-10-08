import api from './api';
import { Review, ApiResponse } from '../types';

export const reviewService = {
  async createReview(data: {
    exchangeId?: string;
    revieweeId: string;
    rating: number;
    feedback: string;
  }): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>('/reviews', data);
    return res.data.data;
  },

  async getReviewsForUser(userId: string): Promise<{ reviews: Review[]; averageRating: number | null; count: number }> {
    const res = await api.get<ApiResponse<{ reviews: Review[]; averageRating: number | null; count: number }>>(`/reviews/user/${userId}`);
    return res.data.data;
  },
};
