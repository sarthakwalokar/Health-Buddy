import { apiClient } from './client';
import { ApiResponse } from '../types';
import {
  MedicalReport,
  MedicalReportDetail,
  MedicalReportParameter,
  ReportType,
  ReportFilterOptions,
  CreateParameterRequest,
  UpdateParameterRequest,
} from '../types/report';

export const reportApi = {
  uploadReport: async (file: File, reportType?: ReportType, notes?: string): Promise<ApiResponse<MedicalReportDetail>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (reportType && reportType !== 'UNKNOWN') {
      formData.append('reportType', reportType);
    }
    if (notes) {
      formData.append('notes', notes);
    }

    const response = await apiClient.post<ApiResponse<MedicalReportDetail>>('/patient/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyReports: async (filters?: ReportFilterOptions): Promise<ApiResponse<MedicalReport[]>> => {
    const params: Record<string, string> = {};
    if (filters?.reportType && filters.reportType !== 'UNKNOWN') {
      params.reportType = filters.reportType;
    }
    if (filters?.status) {
      params.status = filters.status;
    }
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }

    const response = await apiClient.get<ApiResponse<MedicalReport[]>>('/patient/reports', { params });
    return response.data;
  },

  getReportById: async (id: string): Promise<ApiResponse<MedicalReportDetail>> => {
    const response = await apiClient.get<ApiResponse<MedicalReportDetail>>(`/patient/reports/${id}`);
    return response.data;
  },

  downloadReportFile: async (id: string, filename: string): Promise<void> => {
    const response = await apiClient.get(`/patient/reports/${id}/file`, {
      responseType: 'blob',
    });

    const headerContentType = response.headers['content-type'];
    const contentTypeStr = typeof headerContentType === 'string' ? headerContentType : 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentTypeStr });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  getFileBlobUrl: async (id: string): Promise<{ url: string; contentType: string }> => {
    const response = await apiClient.get(`/patient/reports/${id}/file`, {
      responseType: 'blob',
    });
    const headerContentType = response.headers['content-type'];
    const contentType = typeof headerContentType === 'string' ? headerContentType : 'application/pdf';
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    return { url, contentType };
  },

  deleteReport: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/patient/reports/${id}`);
    return response.data;
  },

  verifyReport: async (id: string): Promise<ApiResponse<MedicalReportDetail>> => {
    const response = await apiClient.post<ApiResponse<MedicalReportDetail>>(`/patient/reports/${id}/verify`);
    return response.data;
  },

  getParameters: async (id: string): Promise<ApiResponse<MedicalReportParameter[]>> => {
    const response = await apiClient.get<ApiResponse<MedicalReportParameter[]>>(`/patient/reports/${id}/parameters`);
    return response.data;
  },

  updateParameter: async (
    reportId: string,
    parameterId: string,
    data: UpdateParameterRequest
  ): Promise<ApiResponse<MedicalReportParameter>> => {
    const response = await apiClient.put<ApiResponse<MedicalReportParameter>>(
      `/patient/reports/${reportId}/parameters/${parameterId}`,
      data
    );
    return response.data;
  },

  addParameter: async (
    reportId: string,
    data: CreateParameterRequest
  ): Promise<ApiResponse<MedicalReportParameter>> => {
    const response = await apiClient.post<ApiResponse<MedicalReportParameter>>(
      `/patient/reports/${reportId}/parameters`,
      data
    );
    return response.data;
  },
};
