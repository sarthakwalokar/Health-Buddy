export type DoctorVerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface DoctorProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  verificationStatus: DoctorVerificationStatus;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface DoctorVerificationPayload {
  doctorProfileId: string;
  status: DoctorVerificationStatus;
  rejectionReason?: string;
}
