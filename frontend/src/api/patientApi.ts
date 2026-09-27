import { apiClient } from './client';
import {
  ApiResponse,
  PatientProfile,
  UpdatePatientProfileRequest,
  PatientAllergy,
  CreateAllergyRequest,
  UpdateAllergyRequest,
  PatientCondition,
  CreateConditionRequest,
  UpdateConditionRequest,
  PatientSurgery,
  CreateSurgeryRequest,
  UpdateSurgeryRequest,
  PatientFamilyHistory,
  CreateFamilyHistoryRequest,
  UpdateFamilyHistoryRequest,
  PatientLifestyle,
  UpdateLifestyleRequest,
  PatientHealthGoal,
  CreateHealthGoalRequest,
  UpdateHealthGoalRequest,
  PatientTimelineEvent,
  User,
} from '../types';

export const patientApi = {
  // Profile
  async getProfile(): Promise<ApiResponse<PatientProfile>> {
    const { data } = await apiClient.get<ApiResponse<PatientProfile>>('/patient/profile');
    return data;
  },

  async updateProfile(profile: UpdatePatientProfileRequest): Promise<ApiResponse<PatientProfile>> {
    const { data } = await apiClient.put<ApiResponse<PatientProfile>>('/patient/profile', profile);
    return data;
  },

  async getDashboard(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>('/patient/dashboard');
    return data;
  },

  // Allergies
  async getAllergies(): Promise<ApiResponse<PatientAllergy[]>> {
    const { data } = await apiClient.get<ApiResponse<PatientAllergy[]>>('/patient/allergies');
    return data;
  },

  async createAllergy(request: CreateAllergyRequest): Promise<ApiResponse<PatientAllergy>> {
    const { data } = await apiClient.post<ApiResponse<PatientAllergy>>('/patient/allergies', request);
    return data;
  },

  async updateAllergy(id: string, request: UpdateAllergyRequest): Promise<ApiResponse<PatientAllergy>> {
    const { data } = await apiClient.put<ApiResponse<PatientAllergy>>(`/patient/allergies/${id}`, request);
    return data;
  },

  async deleteAllergy(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/patient/allergies/${id}`);
    return data;
  },

  // Conditions
  async getConditions(): Promise<ApiResponse<PatientCondition[]>> {
    const { data } = await apiClient.get<ApiResponse<PatientCondition[]>>('/patient/conditions');
    return data;
  },

  async createCondition(request: CreateConditionRequest): Promise<ApiResponse<PatientCondition>> {
    const { data } = await apiClient.post<ApiResponse<PatientCondition>>('/patient/conditions', request);
    return data;
  },

  async updateCondition(id: string, request: UpdateConditionRequest): Promise<ApiResponse<PatientCondition>> {
    const { data } = await apiClient.put<ApiResponse<PatientCondition>>(`/patient/conditions/${id}`, request);
    return data;
  },

  async deleteCondition(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/patient/conditions/${id}`);
    return data;
  },

  // Surgeries
  async getSurgeries(): Promise<ApiResponse<PatientSurgery[]>> {
    const { data } = await apiClient.get<ApiResponse<PatientSurgery[]>>('/patient/surgeries');
    return data;
  },

  async createSurgery(request: CreateSurgeryRequest): Promise<ApiResponse<PatientSurgery>> {
    const { data } = await apiClient.post<ApiResponse<PatientSurgery>>('/patient/surgeries', request);
    return data;
  },

  async updateSurgery(id: string, request: UpdateSurgeryRequest): Promise<ApiResponse<PatientSurgery>> {
    const { data } = await apiClient.put<ApiResponse<PatientSurgery>>(`/patient/surgeries/${id}`, request);
    return data;
  },

  async deleteSurgery(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/patient/surgeries/${id}`);
    return data;
  },

  // Family History
  async getFamilyHistory(): Promise<ApiResponse<PatientFamilyHistory[]>> {
    const { data } = await apiClient.get<ApiResponse<PatientFamilyHistory[]>>('/patient/family-history');
    return data;
  },

  async createFamilyHistory(request: CreateFamilyHistoryRequest): Promise<ApiResponse<PatientFamilyHistory>> {
    const { data } = await apiClient.post<ApiResponse<PatientFamilyHistory>>('/patient/family-history', request);
    return data;
  },

  async updateFamilyHistory(id: string, request: UpdateFamilyHistoryRequest): Promise<ApiResponse<PatientFamilyHistory>> {
    const { data } = await apiClient.put<ApiResponse<PatientFamilyHistory>>(`/patient/family-history/${id}`, request);
    return data;
  },

  async deleteFamilyHistory(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/patient/family-history/${id}`);
    return data;
  },

  // Lifestyle
  async getLifestyle(): Promise<ApiResponse<PatientLifestyle>> {
    const { data } = await apiClient.get<ApiResponse<PatientLifestyle>>('/patient/lifestyle');
    return data;
  },

  async updateLifestyle(request: UpdateLifestyleRequest): Promise<ApiResponse<PatientLifestyle>> {
    const { data } = await apiClient.put<ApiResponse<PatientLifestyle>>('/patient/lifestyle', request);
    return data;
  },

  // Health Goals
  async getHealthGoals(): Promise<ApiResponse<PatientHealthGoal[]>> {
    const { data } = await apiClient.get<ApiResponse<PatientHealthGoal[]>>('/patient/health-goals');
    return data;
  },

  async createHealthGoal(request: CreateHealthGoalRequest): Promise<ApiResponse<PatientHealthGoal>> {
    const { data } = await apiClient.post<ApiResponse<PatientHealthGoal>>('/patient/health-goals', request);
    return data;
  },

  async updateHealthGoal(id: string, request: UpdateHealthGoalRequest): Promise<ApiResponse<PatientHealthGoal>> {
    const { data } = await apiClient.put<ApiResponse<PatientHealthGoal>>(`/patient/health-goals/${id}`, request);
    return data;
  },

  async deleteHealthGoal(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/patient/health-goals/${id}`);
    return data;
  },

  // Timeline Foundation
  async getTimeline(): Promise<ApiResponse<PatientTimelineEvent[]>> {
    const { data } = await apiClient.get<ApiResponse<PatientTimelineEvent[]>>('/patient/timeline');
    return data;
  },
};
