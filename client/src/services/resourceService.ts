import api from './api';
import { Resource, ApiResponse } from '../types';

export const resourceService = {
  async getResources(params?: { groupId?: string; roomId?: string }): Promise<Resource[]> {
    const q = new URLSearchParams(params as any).toString();
    const res = await api.get<ApiResponse<Resource[]>>(`/resources?${q}`);
    return res.data.data;
  },

  async createLinkResource(data: {
    name: string;
    url: string;
    groupId?: string;
    roomId?: string;
  }): Promise<Resource> {
    const res = await api.post<ApiResponse<Resource>>('/resources/link', data);
    return res.data.data;
  },

  async uploadFileResource(file: File, meta: { name?: string; groupId?: string; roomId?: string }): Promise<Resource> {
    const formData = new FormData();
    formData.append('file', file);
    if (meta.name) formData.append('name', meta.name);
    if (meta.groupId) formData.append('groupId', meta.groupId);
    if (meta.roomId) formData.append('roomId', meta.roomId);

    const res = await api.post<ApiResponse<Resource>>('/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async deleteResource(id: string): Promise<void> {
    await api.delete(`/resources/${id}`);
  },
};
