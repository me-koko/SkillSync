import api from './api';
import { StudyGroup, ApiResponse, GroupRole } from '../types';

export const groupService = {
  async getGroups(params?: { search?: string; topic?: string; filter?: string }): Promise<StudyGroup[]> {
    const q = new URLSearchParams(params as any).toString();
    const res = await api.get<ApiResponse<StudyGroup[]>>(`/groups?${q}`);
    return res.data.data;
  },

  async getGroupById(id: string): Promise<StudyGroup> {
    const res = await api.get<ApiResponse<StudyGroup>>(`/groups/${id}`);
    return res.data.data;
  },

  async createGroup(data: {
    name: string;
    description: string;
    topic: string;
    isPrivate?: boolean;
    avatarUrl?: string;
  }): Promise<StudyGroup> {
    const res = await api.post<ApiResponse<StudyGroup>>('/groups', data);
    return res.data.data;
  },

  async joinGroup(id: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/groups/${id}/join`);
    return res.data.data;
  },

  async leaveGroup(id: string): Promise<void> {
    await api.post(`/groups/${id}/leave`);
  },

  async updateRole(groupId: string, targetUserId: string, role: GroupRole): Promise<any> {
    const res = await api.put<ApiResponse<any>>(`/groups/${groupId}/roles`, { targetUserId, role });
    return res.data.data;
  },

  async removeMember(groupId: string, memberId: string): Promise<void> {
    await api.delete(`/groups/${groupId}/members/${memberId}`);
  },
};
