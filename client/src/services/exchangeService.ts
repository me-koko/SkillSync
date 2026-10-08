import api from './api';
import { SkillExchange, ApiResponse, ExchangeStatus } from '../types';

export const exchangeService = {
  async getExchanges(): Promise<SkillExchange[]> {
    const res = await api.get<ApiResponse<SkillExchange[]>>('/exchanges');
    return res.data.data;
  },

  async getExchangeById(id: string): Promise<SkillExchange> {
    const res = await api.get<ApiResponse<SkillExchange>>(`/exchanges/${id}`);
    return res.data.data;
  },

  async createExchange(data: {
    partnerId: string;
    teachSkill: string;
    learnSkill: string;
    schedule: string;
    format?: string;
    notes?: string;
  }): Promise<SkillExchange> {
    const res = await api.post<ApiResponse<SkillExchange>>('/exchanges', data);
    return res.data.data;
  },

  async updateExchange(
    id: string,
    data: {
      status?: ExchangeStatus;
      schedule?: string;
      format?: string;
      notes?: string;
    }
  ): Promise<SkillExchange> {
    const res = await api.put<ApiResponse<SkillExchange>>(`/exchanges/${id}`, data);
    return res.data.data;
  },
};
