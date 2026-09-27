import { apiClient } from './client';
import {
  CreateVitalRequest,
  HealthAlertResponse,
  MeasurementType,
  UpdateVitalRequest,
  VitalDashboardSummaryResponse,
  VitalResponse,
  VitalTrendResponse,
  AlertStatus,
} from '../types/vital';

export interface VitalsQueryFilters {
  type?: MeasurementType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const getVitals = async (filters?: VitalsQueryFilters) => {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      content: VitalResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    };
  }>('/patient/vitals', { params: filters });
  return response.data.data;
};

export const getVitalById = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: VitalResponse }>(
    `/patient/vitals/${id}`
  );
  return response.data.data;
};

export const recordVital = async (data: CreateVitalRequest) => {
  const response = await apiClient.post<{ success: boolean; message: string; data: VitalResponse }>(
    '/patient/vitals',
    data
  );
  return response.data.data;
};

export const updateVital = async (id: string, data: UpdateVitalRequest) => {
  const response = await apiClient.put<{ success: boolean; message: string; data: VitalResponse }>(
    `/patient/vitals/${id}`,
    data
  );
  return response.data.data;
};

export const deleteVital = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/patient/vitals/${id}`
  );
  return response.data;
};

export const getVitalTrends = async (
  type: MeasurementType,
  period: string = '30_DAYS',
  start?: string,
  end?: string
) => {
  const response = await apiClient.get<{ success: boolean; data: VitalTrendResponse }>(
    `/patient/vitals/trends/${type}`,
    { params: { period, start, end } }
  );
  return response.data.data;
};

export const getVitalsDashboardSummary = async () => {
  const response = await apiClient.get<{ success: boolean; data: VitalDashboardSummaryResponse }>(
    '/patient/vitals/summary'
  );
  return response.data.data;
};

export const getHealthAlerts = async (status?: AlertStatus, page: number = 0, size: number = 20) => {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      content: HealthAlertResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
    };
  }>('/patient/alerts', { params: { status, page, size } });
  return response.data.data;
};

export const getUnreadAlertCount = async () => {
  const response = await apiClient.get<{ success: boolean; data: { unreadCount: number } }>(
    '/patient/alerts/unread-count'
  );
  return response.data.data.unreadCount;
};

export const acknowledgeAlert = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: HealthAlertResponse }>(
    `/patient/alerts/${id}/acknowledge`
  );
  return response.data.data;
};

export const markAlertRead = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: HealthAlertResponse }>(
    `/patient/alerts/${id}/read`
  );
  return response.data.data;
};
