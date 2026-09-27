import { apiClient } from './client';
import { ApiResponse, DoctorProfile } from '../types';

export const doctorApi = {
  async getProfile(): Promise<ApiResponse<DoctorProfile>> {
    const { data } = await apiClient.get<ApiResponse<DoctorProfile>>('/doctor/profile');
    return data;
  },

  async getDashboard(): Promise<ApiResponse<DoctorProfile>> {
    const { data } = await apiClient.get<ApiResponse<DoctorProfile>>('/doctor/dashboard');
    return data;
  },
};
