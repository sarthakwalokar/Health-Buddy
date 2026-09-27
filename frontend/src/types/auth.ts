import { RoleType } from './user';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  fullName: string;
  role: RoleType;
  verificationStatus?: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface PatientRegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface DoctorRegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
