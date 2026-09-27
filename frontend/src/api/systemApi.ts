import { apiClient } from './client';
import { SystemStatus } from '../types/system';

export const systemApi = {
  getStatus: async (): Promise<SystemStatus> => {
    try {
      const response = await apiClient.get<SystemStatus>('/system/status');
      return response.data;
    } catch (error) {
      // Fallback for unreachable backend
      return {
        status: 'DOWN',
        api: 'DOWN',
        database: 'DOWN',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
