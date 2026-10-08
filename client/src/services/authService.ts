import api from './api';
import { User, ApiResponse } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    college: string;
    course: string;
    yearOfStudy: string;
  }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data.message;
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<string> {
    const res = await api.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data.message;
  },
};
