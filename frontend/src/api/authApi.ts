import { apiClient } from './client';
import {
  ApiResponse,
  AuthResponse,
  ChangePasswordPayload,
  DoctorRegisterPayload,
  LoginPayload,
  PatientRegisterPayload,
  User,
} from '../types';

export const authApi = {
  async registerPatient(payload: PatientRegisterPayload): Promise<ApiResponse<AuthResponse>> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register/patient', payload);
    return data;
  },

  async registerDoctor(payload: DoctorRegisterPayload): Promise<ApiResponse<AuthResponse>> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register/doctor', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data;
  },

  async logout(refreshToken?: string | null): Promise<ApiResponse<void>> {
    const { data } = await apiClient.post<ApiResponse<void>>('/auth/logout', { refreshToken });
    return data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<void>> {
    const { data } = await apiClient.post<ApiResponse<void>>('/auth/change-password', payload);
    return data;
  },
};
