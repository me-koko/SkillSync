import api from './api';
import { DiscoverUser, ApiResponse } from '../types';

export interface DiscoverFilters {
  search?: string;
  teachSkill?: string;
  learnSkill?: string;
  skillLevel?: string;
  dayOfWeek?: string;
  learningFormat?: string;
  college?: string;
  yearOfStudy?: string;
}

export const discoverService = {
  async discover(filters: DiscoverFilters = {}): Promise<DiscoverUser[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== 'ALL') {
        params.append(key, val);
      }
    });

    const res = await api.get<ApiResponse<DiscoverUser[]>>(`/discover?${params.toString()}`);
    return res.data.data;
  },

  async getTopMatches(): Promise<DiscoverUser[]> {
    const res = await api.get<ApiResponse<DiscoverUser[]>>('/discover/matches');
    return res.data.data;
  },
};
