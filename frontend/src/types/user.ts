export type RoleType = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  verificationStatus?: string;
  specialization?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  timestamp: string;
}
