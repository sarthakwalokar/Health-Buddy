import { apiClient } from './client';
import {
  ApiResponse,
  AuditLog,
  DoctorProfile,
  DoctorVerificationPayload,
  DoctorVerificationStatus,
  User,
} from '../types';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminApi = {
  async getDashboard(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>('/admin/dashboard');
    return data;
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/admin/users');
    return data;
  },

  async getDoctors(status?: DoctorVerificationStatus): Promise<ApiResponse<DoctorProfile[]>> {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<ApiResponse<DoctorProfile[]>>('/admin/doctors', { params });
    return data;
  },

  async verifyDoctor(payload: DoctorVerificationPayload): Promise<ApiResponse<DoctorProfile>> {
    const { data } = await apiClient.post<ApiResponse<DoctorProfile>>('/admin/doctors/verify', payload);
    return data;
  },

  async toggleUserStatus(userId: string, enabled: boolean): Promise<ApiResponse<User>> {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, null, {
      params: { enabled },
    });
    return data;
  },

  async getAuditLogs(page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/audit-logs', {
      params: { page, size },
    });
    return data;
  },
};
