export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  occupation?: string;
  maritalStatus?: string;
  profilePhotoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePatientProfileRequest {
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  occupation?: string;
  maritalStatus?: string;
  profilePhotoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN';
export type AllergyStatus = 'ACTIVE' | 'RESOLVED' | 'UNKNOWN';

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string;
  severity: AllergySeverity;
  notes?: string;
  status: AllergyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAllergyRequest {
  allergen: string;
  reaction?: string;
  severity: AllergySeverity;
  notes?: string;
  status: AllergyStatus;
}

export interface UpdateAllergyRequest {
  allergen?: string;
  reaction?: string;
  severity?: AllergySeverity;
  notes?: string;
  status?: AllergyStatus;
}

export type ConditionStatus = 'ACTIVE' | 'RESOLVED' | 'HISTORICAL' | 'UNKNOWN';
export type ConditionSource = 'PATIENT_REPORTED' | 'DOCTOR_REPORTED' | 'IMPORTED';

export interface PatientCondition {
  id: string;
  patientId: string;
  conditionName: string;
  diagnosedDate?: string;
  status: ConditionStatus;
  notes?: string;
  source: ConditionSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConditionRequest {
  conditionName: string;
  diagnosedDate?: string;
  status: ConditionStatus;
  notes?: string;
  source?: ConditionSource;
}

export interface UpdateConditionRequest {
  conditionName?: string;
  diagnosedDate?: string;
  status?: ConditionStatus;
  notes?: string;
  source?: ConditionSource;
}

export interface PatientSurgery {
  id: string;
  patientId: string;
  procedureName: string;
  dateOfSurgery?: string;
  hospitalName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurgeryRequest {
  procedureName: string;
  dateOfSurgery?: string;
  hospitalName?: string;
  notes?: string;
}

export interface UpdateSurgeryRequest {
  procedureName?: string;
  dateOfSurgery?: string;
  hospitalName?: string;
  notes?: string;
}

export type FamilyRelationship = 'FATHER' | 'MOTHER' | 'SIBLING' | 'GRANDPARENT' | 'CHILD' | 'OTHER';

export interface PatientFamilyHistory {
  id: string;
  patientId: string;
  relationship: FamilyRelationship;
  condition: string;
  ageOfOnset?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyHistoryRequest {
  relationship: FamilyRelationship;
  condition: string;
  ageOfOnset?: number;
  notes?: string;
}

export interface UpdateFamilyHistoryRequest {
  relationship?: FamilyRelationship;
  condition?: string;
  ageOfOnset?: number;
  notes?: string;
}

export type SmokingStatus = 'NEVER' | 'FORMER' | 'CURRENT' | 'UNKNOWN';
export type AlcoholStatus = 'NEVER' | 'FORMER' | 'CURRENT' | 'UNKNOWN';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
export type DietaryPreference = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'VEGAN' | 'EGGETARIAN' | 'OTHER' | 'NOT_SPECIFIED';

export interface PatientLifestyle {
  id: string;
  patientId: string;
  smokingStatus: SmokingStatus;
  alcoholStatus: AlcoholStatus;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  sleepHours?: number;
  waterIntakeLiters?: number;
  occupationType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLifestyleRequest {
  smokingStatus?: SmokingStatus;
  alcoholStatus?: AlcoholStatus;
  activityLevel?: ActivityLevel;
  dietaryPreference?: DietaryPreference;
  sleepHours?: number;
  waterIntakeLiters?: number;
  occupationType?: string;
  notes?: string;
}

export type HealthGoalType = 'WEIGHT' | 'FITNESS' | 'NUTRITION' | 'SLEEP' | 'HYDRATION' | 'GENERAL_WELLNESS' | 'OTHER';
export type HealthGoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface PatientHealthGoal {
  id: string;
  patientId: string;
  goalType: HealthGoalType;
  description: string;
  targetValue?: string;
  targetUnit?: string;
  targetDate?: string;
  status: HealthGoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthGoalRequest {
  goalType: HealthGoalType;
  description: string;
  targetValue?: string;
  targetUnit?: string;
  targetDate?: string;
  status: HealthGoalStatus;
}

export interface UpdateHealthGoalRequest {
  goalType?: HealthGoalType;
  description?: string;
  targetValue?: string;
  targetUnit?: string;
  targetDate?: string;
  status?: HealthGoalStatus;
}

export interface PatientTimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string;
  eventDate: string;
  source: string;
  category: string;
  referenceId?: string;
}
