import api from './api';
import { Message, ApiResponse } from '../types';

export interface ConversationSummary {
  peer: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college: string;
  };
  lastMessage?: Message | null;
  unreadCount: number;
}

export const chatService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const res = await api.get<ApiResponse<ConversationSummary[]>>('/messages/conversations');
    return res.data.data;
  },

  async getDirectMessages(peerId: string): Promise<Message[]> {
    const res = await api.get<ApiResponse<Message[]>>(`/messages/direct/${peerId}`);
    return res.data.data;
  },

  async sendMessage(data: {
    content: string;
    receiverId?: string;
    groupId?: string;
    roomId?: string;
  }): Promise<Message> {
    const res = await api.post<ApiResponse<Message>>('/messages', data);
    return res.data.data;
  },
};
