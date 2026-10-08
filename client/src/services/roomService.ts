import api from './api';
import { StudyRoom, ApiResponse } from '../types';

export const roomService = {
  async getRooms(params?: { search?: string; topic?: string }): Promise<StudyRoom[]> {
    const q = new URLSearchParams(params as any).toString();
    const res = await api.get<ApiResponse<StudyRoom[]>>(`/study-rooms?${q}`);
    return res.data.data;
  },

  async getRoomById(id: string): Promise<StudyRoom> {
    const res = await api.get<ApiResponse<StudyRoom>>(`/study-rooms/${id}`);
    return res.data.data;
  },

  async createRoom(data: {
    name: string;
    topic: string;
    isPrivate?: boolean;
    sharedNotes?: string;
  }): Promise<StudyRoom> {
    const res = await api.post<ApiResponse<StudyRoom>>('/study-rooms', data);
    return res.data.data;
  },

  async joinRoom(id: string): Promise<void> {
    await api.post(`/study-rooms/${id}/join`);
  },

  async updateNotes(id: string, sharedNotes: string): Promise<{ sharedNotes: string }> {
    const res = await api.put<ApiResponse<{ sharedNotes: string }>>(`/study-rooms/${id}/notes`, { sharedNotes });
    return res.data.data;
  },

  async updateTimer(id: string, activeTimer: number, isTimerOn: boolean): Promise<StudyRoom> {
    const res = await api.put<ApiResponse<StudyRoom>>(`/study-rooms/${id}/timer`, { activeTimer, isTimerOn });
    return res.data.data;
  },
};
