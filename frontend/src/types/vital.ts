export type MeasurementType =
  | 'BLOOD_PRESSURE'
  | 'HEART_RATE'
  | 'BLOOD_GLUCOSE'
  | 'TEMPERATURE'
  | 'SPO2'
  | 'WEIGHT'
  | 'HEIGHT'
  | 'BMI';

export type MeasurementSource =
  | 'MANUAL'
  | 'MEDICAL_REPORT'
  | 'DEVICE'
  | 'IMPORTED'
  | 'SYSTEM_CALCULATED';

export type MeasurementContext =
  | 'FASTING'
  | 'POST_MEAL'
  | 'RANDOM'
  | 'RESTING'
  | 'BEFORE_EXERCISE'
  | 'AFTER_EXERCISE'
  | 'OTHER';

export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export type AlertStatus = 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface VitalResponse {
  id: string;
  measurementType: MeasurementType;
  valueNumeric: number;
  secondaryValueNumeric?: number;
  systolic?: number;
  diastolic?: number;
  formattedValue: string;
  unit: string;
  measurementTime: string;
  source: MeasurementSource;
  measurementContext?: MeasurementContext;
  sourceReportId?: string;
  sourceReportName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalTrendDataPoint {
  timestamp: string;
  value: number;
  secondaryValue?: number;
  context?: MeasurementContext;
}

export interface VitalTrendResponse {
  measurementType: MeasurementType;
  unit: string;
  period: string;
  latestValue?: number;
  latestSecondaryValue?: number;
  minValue?: number;
  maxValue?: number;
  averageValue?: number;
  minSecondaryValue?: number;
  maxSecondaryValue?: number;
  averageSecondaryValue?: number;
  changeFromPreviousPeriod?: number;
  descriptiveSummary: string;
  totalReadings: number;
  dataPoints: VitalTrendDataPoint[];
}

export interface VitalSummaryItem {
  measurementType: MeasurementType;
  latestReading?: VitalResponse;
  previousValue?: number;
  change?: number;
  statusNote?: string;
}

export interface VitalDashboardSummaryResponse {
  vitals: Record<MeasurementType, VitalSummaryItem>;
  latestBmi?: VitalResponse;
  unreadAlertsCount: number;
  totalMeasurementsRecorded: number;
}

export interface CreateVitalRequest {
  measurementType: MeasurementType;
  valueNumeric?: number;
  secondaryValueNumeric?: number;
  systolic?: number;
  diastolic?: number;
  unit?: string;
  measurementTime: string;
  measurementContext?: MeasurementContext;
  sourceReportId?: string;
  notes?: string;
}

export interface UpdateVitalRequest {
  valueNumeric?: number;
  secondaryValueNumeric?: number;
  systolic?: number;
  diastolic?: number;
  unit?: string;
  measurementTime?: string;
  measurementContext?: MeasurementContext;
  notes?: string;
}

export interface HealthAlertResponse {
  id: string;
  measurementId?: string;
  alertType: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  acknowledgedAt?: string;
  createdAt: string;
}
