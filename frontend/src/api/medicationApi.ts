import { apiClient } from './client';
import {
  CreateMedicationRequest,
  DoseStatus,
  MedicationAdherenceResponse,
  MedicationDoseResponse,
  MedicationReminderResponse,
  MedicationResponse,
  MedicationStatus,
  RecordDoseActionRequest,
  ReminderStatus,
  TodayMedicationsSummaryResponse,
  UpdateMedicationRequest,
  UpdateReminderSettingsRequest,
} from '../types/medication';

export interface MedicationsQueryFilters {
  status?: MedicationStatus;
  query?: string;
  page?: number;
  size?: number;
}

export interface DosesQueryFilters {
  medicationId?: string;
  status?: DoseStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const getMedications = async (filters?: MedicationsQueryFilters) => {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      content: MedicationResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    };
  }>('/patient/medications', { params: filters });
  return response.data.data;
};

export const getMedicationById = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: MedicationResponse }>(
    `/patient/medications/${id}`
  );
  return response.data.data;
};

export const createMedication = async (data: CreateMedicationRequest) => {
  const response = await apiClient.post<{ success: boolean; message: string; data: MedicationResponse }>(
    '/patient/medications',
    data
  );
  return response.data.data;
};

export const updateMedication = async (id: string, data: UpdateMedicationRequest) => {
  const response = await apiClient.put<{ success: boolean; message: string; data: MedicationResponse }>(
    `/patient/medications/${id}`,
    data
  );
  return response.data.data;
};

export const deleteMedication = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/patient/medications/${id}`
  );
  return response.data;
};

export const pauseMedication = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: MedicationResponse }>(
    `/patient/medications/${id}/pause`
  );
  return response.data.data;
};

export const resumeMedication = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: MedicationResponse }>(
    `/patient/medications/${id}/resume`
  );
  return response.data.data;
};

export const stopMedication = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: MedicationResponse }>(
    `/patient/medications/${id}/stop`
  );
  return response.data.data;
};

export const completeMedication = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: MedicationResponse }>(
    `/patient/medications/${id}/complete`
  );
  return response.data.data;
};

export const getDoses = async (filters?: DosesQueryFilters) => {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      content: MedicationDoseResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    };
  }>('/patient/medication-doses', { params: filters });
  return response.data.data;
};

export const getTodayDoses = async () => {
  const response = await apiClient.get<{ success: boolean; data: TodayMedicationsSummaryResponse }>(
    '/patient/medication-doses/today'
  );
  return response.data.data;
};

export const markDoseTaken = async (id: string, data?: RecordDoseActionRequest) => {
  const response = await apiClient.post<{ success: boolean; message: string; data: MedicationDoseResponse }>(
    `/patient/medication-doses/${id}/taken`,
    data || {}
  );
  return response.data.data;
};

export const markDoseSkipped = async (id: string, data?: RecordDoseActionRequest) => {
  const response = await apiClient.post<{ success: boolean; message: string; data: MedicationDoseResponse }>(
    `/patient/medication-doses/${id}/skipped`,
    data || {}
  );
  return response.data.data;
};

export const markDoseMissed = async (id: string, data?: RecordDoseActionRequest) => {
  const response = await apiClient.post<{ success: boolean; message: string; data: MedicationDoseResponse }>(
    `/patient/medication-doses/${id}/missed`,
    data || {}
  );
  return response.data.data;
};

export interface AdherenceQueryParams {
  medicationId?: string;
  period?: string;
  start?: string;
  end?: string;
}

export const getMedicationAdherence = async (
  id: string,
  period: string = '30_DAYS',
  start?: string,
  end?: string
) => {
  const response = await apiClient.get<{ success: boolean; data: MedicationAdherenceResponse }>(
    `/patient/medications/${id}/adherence`,
    { params: { period, start, end } }
  );
  return response.data.data;
};

export const getOverallAdherence = async (
  params?: string | AdherenceQueryParams,
  start?: string,
  end?: string
) => {
  let period = '30_DAYS';
  let medId: string | undefined;
  let startTime = start;
  let endTime = end;

  if (typeof params === 'object' && params !== null) {
    period = params.period || '30_DAYS';
    medId = params.medicationId;
    startTime = params.start;
    endTime = params.end;
  } else if (typeof params === 'string') {
    period = params;
  }

  const endpoint = medId
    ? `/patient/medications/${medId}/adherence`
    : '/patient/medication-doses/adherence';

  const response = await apiClient.get<{ success: boolean; data: MedicationAdherenceResponse }>(
    endpoint,
    { params: { period, start: startTime, end: endTime } }
  );
  return response.data.data;
};

export const getAdherence = getOverallAdherence;

export const getReminders = async (status?: ReminderStatus, page: number = 0, size: number = 20) => {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      content: MedicationReminderResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
    };
  }>('/patient/reminders', { params: { status, page, size } });
  return response.data.data;
};

export const markReminderRead = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: MedicationReminderResponse }>(
    `/patient/reminders/${id}/read`
  );
  return response.data.data;
};

export const updateReminderSettings = async (id: string, data: UpdateReminderSettingsRequest) => {
  const response = await apiClient.put<{ success: boolean; data: MedicationResponse }>(
    `/patient/medications/${id}/reminders`,
    data
  );
  return response.data.data;
};

export const medicationApi = {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  pauseMedication,
  resumeMedication,
  stopMedication,
  completeMedication,
  getDoses,
  getTodayDoses,
  markDoseTaken,
  markDoseSkipped,
  markDoseMissed,
  getMedicationAdherence,
  getAdherence: getOverallAdherence,
  getOverallAdherence,
  getReminders,
  markReminderRead,
  updateReminderSettings,
};

