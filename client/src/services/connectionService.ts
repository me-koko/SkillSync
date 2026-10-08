import api from './api';
import { ConnectionRecord, PendingConnection, ApiResponse } from '../types';

export interface ConnectionsResponse {
  current: ConnectionRecord[];
  incoming: PendingConnection[];
  sent: PendingConnection[];
}

export const connectionService = {
  async getConnections(): Promise<ConnectionsResponse> {
    const res = await api.get<ApiResponse<ConnectionsResponse>>('/connections');
    return res.data.data;
  },

  async sendRequest(receiverId: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/connections', { receiverId });
    return res.data.data;
  },

  async respondRequest(id: string, status: 'ACCEPTED' | 'REJECTED' | 'BLOCKED'): Promise<any> {
    const res = await api.put<ApiResponse<any>>(`/connections/${id}`, { status });
    return res.data.data;
  },

  async removeConnection(id: string): Promise<void> {
    await api.delete(`/connections/${id}`);
  },
};
