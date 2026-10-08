import api from './api';
import { Task, ApiResponse, TaskStatus, TaskPriority } from '../types';

export const taskService = {
  async getTasks(params?: { groupId?: string; roomId?: string; status?: string; priority?: string; scope?: string }): Promise<Task[]> {
    const q = new URLSearchParams(params as any).toString();
    const res = await api.get<ApiResponse<Task[]>>(`/tasks?${q}`);
    return res.data.data;
  },

  async createTask(data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assigneeId?: string;
    groupId?: string;
    roomId?: string;
  }): Promise<Task> {
    const res = await api.post<ApiResponse<Task>>('/tasks', data);
    return res.data.data;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const res = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
