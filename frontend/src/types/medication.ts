export enum MedicationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  STOPPED = 'STOPPED'
}

export enum MedicationSource {
  PATIENT_ENTERED = 'PATIENT_ENTERED',
  DOCTOR_ENTERED = 'DOCTOR_ENTERED',
  IMPORTED = 'IMPORTED',
  OTHER = 'OTHER'
}

export enum MedicationRoute {
  ORAL = 'ORAL',
  TOPICAL = 'TOPICAL',
  INJECTION = 'INJECTION',
  INHALATION = 'INHALATION',
  OPHTHALMIC = 'OPHTHALMIC',
  OTIC = 'OTIC',
  NASAL = 'NASAL',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export enum FrequencyType {
  ONCE_DAILY = 'ONCE_DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  THREE_TIMES_DAILY = 'THREE_TIMES_DAILY',
  FOUR_TIMES_DAILY = 'FOUR_TIMES_DAILY',
  EVERY_X_HOURS = 'EVERY_X_HOURS',
  WEEKLY = 'WEEKLY',
  AS_NEEDED = 'AS_NEEDED',
  CUSTOM = 'CUSTOM'
}

export enum ScheduleType {
  FIXED_TIME = 'FIXED_TIME',
  INTERVAL = 'INTERVAL',
  DAYS_OF_WEEK = 'DAYS_OF_WEEK',
  AS_NEEDED = 'AS_NEEDED',
  CUSTOM = 'CUSTOM'
}

export enum DoseStatus {
  SCHEDULED = 'SCHEDULED',
  TAKEN = 'TAKEN',
  MISSED = 'MISSED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED'
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  READ = 'READ',
  DISMISSED = 'DISMISSED'
}

export enum ReminderChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS'
}

export interface MedicationSchedule {
  id?: string;
  scheduleType?: ScheduleType;
  timeOfDay?: string;
  daysOfWeek?: string;
  intervalHours?: number;
  doseAmount?: number;
  doseUnit?: string;
}

export type MedicationScheduleRequest = MedicationSchedule;

export interface MedicationResponse {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageAmount?: number;
  dosageUnit?: string;
  formattedDosage?: string;
  route: MedicationRoute;
  frequencyType: FrequencyType;
  frequencyValue?: string;
  formattedFrequency?: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  reason?: string;
  prescribedBy?: string;
  source: MedicationSource;
  status: MedicationStatus;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  notes?: string;
  schedules: MedicationSchedule[];
  nextScheduledDose?: string;
  nextDoseAt?: string;
  adherenceRate?: number;
  adherencePercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDoseResponse {
  id: string;
  medicationId: string;
  medicineName: string;
  strength?: string;
  formattedDosage?: string;
  doseAmount?: number;
  doseUnit?: string;
  instructions?: string;
  scheduleId?: string;
  scheduledAt: string;
  takenAt?: string;
  status: DoseStatus;
  notes?: string;
}

export interface TodayMedicationsSummaryResponse {
  totalScheduledToday: number;
  takenToday: number;
  upcomingToday: number;
  missedToday: number;
  skippedToday: number;
  doses: MedicationDoseResponse[];
  overallAdherenceRate: number;
  activeMedicationsCount: number;
}

export interface MedicationAdherenceSummary {
  medicationId: string;
  medicineName: string;
  strength?: string;
  scheduledDoses: number;
  takenDoses: number;
  skippedDoses: number;
  missedDoses: number;
  adherencePercentage: number;
}

export interface MedicationAdherenceResponse {
  period: string;
  periodLabel: string;
  overallAdherencePercentage: number;
  totalScheduledDoses: number;
  totalTakenDoses: number;
  totalSkippedDoses: number;
  totalMissedDoses: number;
  medicationSummaries: MedicationAdherenceSummary[];
  medications?: MedicationAdherenceSummary[];
  descriptiveSummary: string;
}

export interface MedicationReminderResponse {
  id: string;
  medicationId: string;
  doseId?: string;
  medicineName: string;
  strength?: string;
  reminderTime: string;
  title: string;
  message: string;
  status: ReminderStatus;
  channel: ReminderChannel;
  createdAt: string;
}

export interface CreateMedicationRequest {
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageAmount?: number;
  dosageUnit?: string;
  route?: MedicationRoute;
  frequencyType: FrequencyType;
  frequencyValue?: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  reason?: string;
  prescribedBy?: string;
  source?: MedicationSource;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  notes?: string;
  schedules?: MedicationSchedule[];
}

export interface UpdateMedicationRequest {
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageAmount?: number;
  dosageUnit?: string;
  route?: MedicationRoute;
  frequencyType: FrequencyType;
  frequencyValue?: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  reason?: string;
  prescribedBy?: string;
  status?: MedicationStatus;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  notes?: string;
  schedules?: MedicationSchedule[];
}

export interface RecordDoseActionRequest {
  takenAt?: string;
  notes?: string;
}

export interface UpdateReminderSettingsRequest {
  reminderEnabled: boolean;
  reminderMinutesBefore?: number;
}
