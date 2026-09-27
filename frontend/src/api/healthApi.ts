import { apiClient } from './client';
import { HealthResponse } from '../types';

export const healthApi = {
  async checkHealth(): Promise<HealthResponse> {
    const { data } = await apiClient.get<HealthResponse>('/health');
    return data;
  },
};
