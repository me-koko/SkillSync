import api from './api';
import { Notification, ApiResponse } from '../types';

export interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationsData> {
    const res = await api.get<ApiResponse<NotificationsData>>('/notifications');
    return res.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },
};
