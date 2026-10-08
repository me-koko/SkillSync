import api from './api';
import { User, ApiResponse } from '../types';

export const userService = {
  async getProfile(id: string): Promise<User> {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/users/me', data);
    return res.data.data;
  },

  async completeOnboarding(data: any): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/users/onboarding', data);
    return res.data.data;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post<ApiResponse<{ url: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getAllSkills(): Promise<Array<{ id: string; name: string; category: string }>> {
    const res = await api.get<ApiResponse<Array<{ id: string; name: string; category: string }>>>('/users/skills');
    return res.data.data;
  },

  async getAllInterests(): Promise<Array<{ id: string; name: string; category: string | null }>> {
    const res = await api.get<ApiResponse<Array<{ id: string; name: string; category: string | null }>>>('/users/interests');
    return res.data.data;
  },
};
