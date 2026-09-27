import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import {
  UpdatePatientProfileRequest,
  UpdateLifestyleRequest,
  CreateHealthGoalRequest,
  HealthGoalType,
  HealthGoalStatus,
  SmokingStatus,
  AlcoholStatus,
  ActivityLevel,
  DietaryPreference,
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import {
  User,
  Heart,
  Phone,
  MapPin,
  Flame,
  Target,
  Edit3,
  X,
  Check,
  ShieldCheck,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Info,
  Sparkles,
  Droplets,
  Moon,
  Activity,
} from 'lucide-react';

export const PatientHealthProfilePage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active editing section states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['patientProfile'],
    queryFn: () => patientApi.getProfile(),
  });

  const {
    data: lifestyleData,
    isLoading: isLifestyleLoading,
  } = useQuery({
    queryKey: ['patientLifestyle'],
    queryFn: () => patientApi.getLifestyle(),
  });

  const {
    data: healthGoalsData,
  } = useQuery({
    queryKey: ['patientHealthGoals'],
    queryFn: () => patientApi.getHealthGoals(),
  });

  const {
    data: allergiesData,
  } = useQuery({
    queryKey: ['patientAllergies'],
    queryFn: () => patientApi.getAllergies(),
  });

  const {
    data: conditionsData,
  } = useQuery({
    queryKey: ['patientConditions'],
    queryFn: () => patientApi.getConditions(),
  });

  const profile = profileData?.data;
  const lifestyle = lifestyleData?.data;
  const goals = healthGoalsData?.data || [];
  const allergies = allergiesData?.data || [];
  const conditions = conditionsData?.data || [];

  // Form State - Personal Info
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  // Form State - Body Metrics
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Form State - Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');

  // Form State - Address
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Form State - Lifestyle
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>('UNKNOWN');
  const [alcoholStatus, setAlcoholStatus] = useState<AlcoholStatus>('UNKNOWN');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('UNKNOWN');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('NOT_SPECIFIED');
  const [sleepHours, setSleepHours] = useState<string>('');
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<string>('');
  const [occupationType, setOccupationType] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');

  // Form State - Health Goals Modal / Inline Add
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalType, setGoalType] = useState<HealthGoalType>('GENERAL_WELLNESS');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetValue, setGoalTargetValue] = useState('');
  const [goalTargetUnit, setGoalTargetUnit] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (req: UpdatePatientProfileRequest) => patientApi.updateProfile(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
      setEditingSection(null);
      setSuccessMessage('Health profile successfully updated.');
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage('Failed to save profile changes. Please verify required fields.');
    },
  });

  const updateLifestyleMutation = useMutation({
    mutationFn: (req: UpdateLifestyleRequest) => patientApi.updateLifestyle(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientLifestyle'] });
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
      setEditingSection(null);
      setSuccessMessage('Lifestyle information successfully updated.');
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage('Failed to save lifestyle updates.');
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (req: CreateHealthGoalRequest) => patientApi.createHealthGoal(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientHealthGoals'] });
      setIsAddingGoal(false);
      setGoalDescription('');
      setGoalTargetValue('');
      setGoalTargetUnit('');
      setGoalTargetDate('');
      setSuccessMessage('Health goal created successfully.');
    },
    onError: () => {
      setErrorMessage('Failed to add health goal.');
    },
  });

  const updateGoalStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: HealthGoalStatus }) =>
      patientApi.updateHealthGoal(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientHealthGoals'] });
      setSuccessMessage('Health goal status updated.');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => patientApi.deleteHealthGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientHealthGoals'] });
      setSuccessMessage('Health goal deleted.');
    },
  });

  // Start Section Edits
  const startEditing = (section: string) => {
    setEditingSection(section);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (section === 'personal' && profile) {
      setDob(profile.dateOfBirth || '');
      setGender(profile.gender || '');
      setOccupation(profile.occupation || '');
      setMaritalStatus(profile.maritalStatus || '');
      setProfilePhotoUrl(profile.profilePhotoUrl || '');
    } else if (section === 'body' && profile) {
      setHeightCm(profile.heightCm ? String(profile.heightCm) : '');
      setWeightKg(profile.weightKg ? String(profile.weightKg) : '');
      setBloodGroup(profile.bloodGroup || '');
    } else if (section === 'emergency' && profile) {
      setEmergencyContactName(profile.emergencyContactName || '');
      setEmergencyContactPhone(profile.emergencyContactPhone || '');
      setEmergencyContactRelationship(profile.emergencyContactRelationship || '');
    } else if (section === 'address' && profile) {
      setAddressLine(profile.addressLine || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPostalCode(profile.postalCode || '');
      setCountry(profile.country || '');
    } else if (section === 'lifestyle' && lifestyle) {
      setSmokingStatus(lifestyle.smokingStatus || 'UNKNOWN');
      setAlcoholStatus(lifestyle.alcoholStatus || 'UNKNOWN');
      setActivityLevel(lifestyle.activityLevel || 'UNKNOWN');
      setDietaryPreference(lifestyle.dietaryPreference || 'NOT_SPECIFIED');
      setSleepHours(lifestyle.sleepHours ? String(lifestyle.sleepHours) : '');
      setWaterIntakeLiters(lifestyle.waterIntakeLiters ? String(lifestyle.waterIntakeLiters) : '');
      setOccupationType(lifestyle.occupationType || '');
      setLifestyleNotes(lifestyle.notes || '');
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setErrorMessage(null);
  };

  // Section Save Handlers
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      dateOfBirth: dob || undefined,
      gender: gender || undefined,
      occupation: occupation || undefined,
      maritalStatus: maritalStatus || undefined,
      profilePhotoUrl: profilePhotoUrl || undefined,
    });
  };

  const handleSaveBody = (e: React.FormEvent) => {
    e.preventDefault();
    const h = heightCm ? parseFloat(heightCm) : undefined;
    const w = weightKg ? parseFloat(weightKg) : undefined;
    updateProfileMutation.mutate({
      heightCm: h,
      weightKg: w,
      bloodGroup: bloodGroup || undefined,
    });
  };

  const handleSaveEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      emergencyContactName: emergencyContactName || undefined,
      emergencyContactPhone: emergencyContactPhone || undefined,
      emergencyContactRelationship: emergencyContactRelationship || undefined,
    });
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      addressLine: addressLine || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,
    });
  };

  const handleSaveLifestyle = (e: React.FormEvent) => {
    e.preventDefault();
    const s = sleepHours ? parseFloat(sleepHours) : undefined;
    const w = waterIntakeLiters ? parseFloat(waterIntakeLiters) : undefined;
    updateLifestyleMutation.mutate({
      smokingStatus,
      alcoholStatus,
      activityLevel,
      dietaryPreference,
      sleepHours: s,
      waterIntakeLiters: w,
      occupationType: occupationType || undefined,
      notes: lifestyleNotes || undefined,
    });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDescription.trim()) return;
    createGoalMutation.mutate({
      goalType,
      description: goalDescription.trim(),
      targetValue: goalTargetValue.trim() || undefined,
      targetUnit: goalTargetUnit.trim() || undefined,
      targetDate: goalTargetDate || undefined,
      status: 'ACTIVE',
    });
  };

  if (isProfileLoading || isLifestyleLoading) {
    return (
      <LoadingState
        message="Loading patient health profile..."
        subMessage="Querying encrypted health profile records"
      />
    );
  }

  if (profileError || !profile) {
    return (
      <ErrorState
        message="Unable to load patient profile records."
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['patientProfile'] })}
      />
    );
  }

  const completion = profile.completionPercentage ?? 0;

  // Informational BMI Calculation
  let calculatedBmi: string | null = null;
  if (profile.heightCm && profile.weightKg && profile.heightCm > 0) {
    const heightInMeters = profile.heightCm / 100;
    const bmiVal = profile.weightKg / (heightInMeters * heightInMeters);
    calculatedBmi = bmiVal.toFixed(1);
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Header & Clinical Safety Disclaimer */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">Health Profile</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                Patient Vault
              </span>
            </div>
            <p className="text-sm text-muted mt-1 font-medium">
              Keep your personal health indicators, emergency contacts, and lifestyle factors up to date.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-amber-100 text-emerald-950 text-xs font-extrabold border border-emerald-300 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Patient-Owned Vault
            </span>
          </div>
        </div>

        {/* Radiant Profile Completion Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-white via-emerald-50/40 to-amber-50/60 p-5 sm:p-6 border border-emerald-200/80 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Health Data Completeness
                </span>
                <span className="text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  {completion}% complete
                </span>
              </div>
              <p className="text-xs text-muted font-medium max-w-xl">
                Calculated deterministically based on verified demographics, emergency contacts, physical measurements, and lifestyle habits.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <div className="w-full bg-stone-200/80 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
            <strong className="font-extrabold text-amber-950">Clinical Decision Support Notice:</strong> Health Buddy stores patient-reported and doctor-reviewed records to facilitate tele-connectivity. Stored data does not constitute autonomous medical diagnosis or automatic prescription.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* SECTION 1: PERSONAL INFORMATION */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-primary-dark shadow-xs">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Personal Information</h2>
              <p className="text-xs text-muted font-medium">Basic identity and demographic attributes</p>
            </div>
          </div>
          {editingSection !== 'personal' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing('personal')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
          )}
        </div>

        {editingSection === 'personal' ? (
          <form onSubmit={handleSavePersonal} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Full Name (Account Registered)" value={profile.fullName || ''} disabled />
              <Input label="Email Address" value={profile.email || ''} disabled />
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <Input
                label="Occupation"
                placeholder="e.g. Software Engineer"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Marital Status
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
                >
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[11px] font-bold uppercase text-muted block">Full Name</span>
              <span className="font-bold text-charcoal text-sm mt-0.5 block">{profile.fullName || '—'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 sm:col-span-2">
              <span className="text-[11px] font-bold uppercase text-muted block">Email Address</span>
              <span className="font-bold text-charcoal text-sm mt-0.5 block truncate">{profile.email || '—'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[11px] font-bold uppercase text-muted block">Date of Birth</span>
              <span className="font-bold text-charcoal text-sm mt-0.5 block">
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not set'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[11px] font-bold uppercase text-muted block">Gender</span>
              <span className="font-bold text-charcoal text-sm mt-0.5 block">{profile.gender || 'Not specified'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-[11px] font-bold uppercase text-muted block">Marital Status</span>
              <span className="font-bold text-charcoal text-sm mt-0.5 block">{profile.maritalStatus || 'Not specified'}</span>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 2: BODY & BASIC HEALTH */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shadow-xs">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Body & Basic Health</h2>
              <p className="text-xs text-muted font-medium">Recorded physical measurements and blood typing</p>
            </div>
          </div>
          {editingSection !== 'body' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing('body')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
          )}
        </div>

        {editingSection === 'body' ? (
          <form onSubmit={handleSaveBody} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Height (cm)"
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g. 175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                min="1"
                max="500"
                placeholder="e.g. 70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Body Metrics
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Height</span>
              <span className="text-xl font-black text-charcoal mt-1 block">
                {profile.heightCm ? `${profile.heightCm} cm` : 'Not set'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-teal-50/80 to-white rounded-2xl border border-teal-100 shadow-xs">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wide block">Weight</span>
              <span className="text-xl font-black text-charcoal mt-1 block">
                {profile.weightKg ? `${profile.weightKg} kg` : 'Not set'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-rose-50/80 to-white rounded-2xl border border-rose-100 shadow-xs">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wide block">Blood Group</span>
              <span className="text-xl font-black text-rose-700 mt-1 block">
                {profile.bloodGroup || 'Not set'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50/80 to-white rounded-2xl border border-amber-200/80 shadow-xs">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">Calculated BMI</span>
              <span className="text-xl font-black text-amber-800 mt-1 block">
                {calculatedBmi ? `${calculatedBmi} kg/m²` : '—'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 3: EMERGENCY CONTACT */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-xs">
              <Phone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Emergency Contact</h2>
              <p className="text-xs text-muted font-medium">Designated contact for urgent clinical care notifications</p>
            </div>
          </div>
          {editingSection !== 'emergency' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing('emergency')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
          )}
        </div>

        {editingSection === 'emergency' ? (
          <form onSubmit={handleSaveEmergency} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Contact Full Name"
                placeholder="e.g. Jane Doe"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
              <Input
                label="Relationship"
                placeholder="e.g. Spouse, Parent, Sibling"
                value={emergencyContactRelationship}
                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
              />
              <Input
                label="Contact Phone"
                type="tel"
                placeholder="e.g. +1 555 123 4567"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Emergency Contact
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold uppercase text-muted block">Designated Name</span>
              <span className="font-extrabold text-charcoal text-base mt-1 block">
                {profile.emergencyContactName || 'Not designated'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold uppercase text-muted block">Relationship</span>
              <span className="font-extrabold text-charcoal text-base mt-1 block">
                {profile.emergencyContactRelationship || 'Not designated'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold uppercase text-muted block">Phone Number</span>
              <span className="font-extrabold text-primary-dark text-base mt-1 block">
                {profile.emergencyContactPhone || 'Not designated'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 4: ADDRESS */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-primary shadow-xs">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Residential Address</h2>
              <p className="text-xs text-muted font-medium">Geographic location for localized care coordination</p>
            </div>
          </div>
          {editingSection !== 'address' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing('address')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
          )}
        </div>

        {editingSection === 'address' ? (
          <form onSubmit={handleSaveAddress} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <Input
                  label="Street Address"
                  placeholder="e.g. 123 Healthcare Blvd, Suite 400"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                />
              </div>
              <Input
                label="City"
                placeholder="e.g. Boston"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State / Province"
                placeholder="e.g. MA"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <Input
                label="Postal Code"
                placeholder="e.g. 02115"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
              <Input
                label="Country"
                placeholder="e.g. United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Address
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold uppercase text-muted block">Street Address</span>
              <span className="font-extrabold text-charcoal text-base mt-1 block">
                {profile.addressLine || 'Not provided'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold uppercase text-muted block">City, State</span>
              <span className="font-extrabold text-charcoal text-base mt-1 block">
                {profile.city || profile.state ? `${profile.city || ''} ${profile.state || ''}`.trim() : 'Not provided'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold uppercase text-muted block">Postal Code, Country</span>
              <span className="font-extrabold text-charcoal text-base mt-1 block">
                {profile.postalCode || profile.country ? `${profile.postalCode || ''} ${profile.country || ''}`.trim() : 'Not provided'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 5: LIFESTYLE INFORMATION */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-xs">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Lifestyle & Habits</h2>
              <p className="text-xs text-muted font-medium">Everyday routine factors and wellness habits</p>
            </div>
          </div>
          {editingSection !== 'lifestyle' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing('lifestyle')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
          )}
        </div>

        {editingSection === 'lifestyle' ? (
          <form onSubmit={handleSaveLifestyle} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Smoking Status
                </label>
                <select
                  value={smokingStatus}
                  onChange={(e) => setSmokingStatus(e.target.value as SmokingStatus)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="NEVER">Never</option>
                  <option value="FORMER">Former smoker</option>
                  <option value="CURRENT">Current smoker</option>
                  <option value="UNKNOWN">Unknown / Unspecified</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Alcohol Status
                </label>
                <select
                  value={alcoholStatus}
                  onChange={(e) => setAlcoholStatus(e.target.value as AlcoholStatus)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="NEVER">Never</option>
                  <option value="FORMER">Former drinker</option>
                  <option value="CURRENT">Current / Occasional</option>
                  <option value="UNKNOWN">Unknown / Unspecified</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="SEDENTARY">Sedentary</option>
                  <option value="LIGHT">Light</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="NOT_SPECIFIED">Not Specified</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <Input
                label="Daily Sleep (Hours)"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="e.g. 7.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />

              <Input
                label="Water Intake (Liters/day)"
                type="number"
                step="0.1"
                min="0"
                max="20"
                placeholder="e.g. 2.5"
                value={waterIntakeLiters}
                onChange={(e) => setWaterIntakeLiters(e.target.value)}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Occupation Environment / Work Routine"
                  placeholder="e.g. Desk job, remote, frequent travel"
                  value={occupationType}
                  onChange={(e) => setOccupationType(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                Lifestyle Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={lifestyleNotes}
                onChange={(e) => setLifestyleNotes(e.target.value)}
                placeholder="Any relevant routine details..."
                className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateLifestyleMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Lifestyle
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-sm">
            <div className="p-4 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Smoking
              </span>
              <span className="font-black text-charcoal text-sm mt-1.5 block">
                {lifestyle?.smokingStatus || 'Unknown'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-rose-500" /> Alcohol
              </span>
              <span className="font-black text-charcoal text-sm mt-1.5 block">
                {lifestyle?.alcoholStatus || 'Unknown'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Activity
              </span>
              <span className="font-black text-charcoal text-sm mt-1.5 block">
                {lifestyle?.activityLevel || 'Unknown'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Diet
              </span>
              <span className="font-black text-charcoal text-sm mt-1.5 block truncate">
                {lifestyle?.dietaryPreference?.replace('_', ' ') || 'Unspecified'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep
              </span>
              <span className="font-black text-charcoal text-sm mt-1.5 block">
                {lifestyle?.sleepHours ? `${lifestyle.sleepHours} hrs` : '—'}
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" /> Hydration
              </span>
              <span className="font-black text-charcoal text-sm mt-1.5 block">
                {lifestyle?.waterIntakeLiters ? `${lifestyle.waterIntakeLiters} L` : '—'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 6: HEALTH GOALS */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-primary shadow-xs">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Health & Wellness Goals</h2>
              <p className="text-xs text-muted font-medium">Personal self-management targets</p>
            </div>
          </div>
          {!isAddingGoal && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddingGoal(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Goal
            </Button>
          )}
        </div>

        {isAddingGoal && (
          <form onSubmit={handleAddGoal} className="p-5 mb-5 bg-gradient-to-br from-white to-amber-50/40 rounded-2xl border border-amber-200/80 space-y-4 shadow-sm">
            <h4 className="font-black text-sm text-charcoal">Create New Health Goal</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Goal Type
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as HealthGoalType)}
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="GENERAL_WELLNESS">General Wellness</option>
                  <option value="WEIGHT">Weight Management</option>
                  <option value="FITNESS">Fitness & Steps</option>
                  <option value="NUTRITION">Nutrition</option>
                  <option value="SLEEP">Sleep Quality</option>
                  <option value="HYDRATION">Hydration</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Description"
                  placeholder="e.g. Walk 8,000 steps daily or maintain 72kg weight"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Target Value (Optional)"
                placeholder="e.g. 72 or 8000"
                value={goalTargetValue}
                onChange={(e) => setGoalTargetValue(e.target.value)}
              />

              <Input
                label="Target Unit (Optional)"
                placeholder="e.g. kg, steps/day, hrs"
                value={goalTargetUnit}
                onChange={(e) => setGoalTargetUnit(e.target.value)}
              />

              <Input
                label="Target Date (Optional)"
                type="date"
                value={goalTargetDate}
                onChange={(e) => setGoalTargetDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={createGoalMutation.isPending}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Save Goal
              </Button>
            </div>
          </form>
        )}

        {goals.length === 0 && !isAddingGoal ? (
          <EmptyState
            title="No health goals established"
            description="Set personal targets for sleep, hydration, exercise, or weight to support your wellness journey."
            icon={<Target className="w-6 h-6 text-muted" />}
            actionLabel="Add First Goal"
            onAction={() => setIsAddingGoal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-5 bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={goal.status === 'ACTIVE' ? 'primary' : 'neutral'} size="sm">
                      {goal.goalType.replace('_', ' ')}
                    </Badge>
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        goal.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : goal.status === 'COMPLETED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-charcoal">{goal.description}</h4>
                  {(goal.targetValue || goal.targetDate) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-medium">
                      {goal.targetValue && (
                        <span className="font-bold text-primary-dark">
                          Target: {goal.targetValue} {goal.targetUnit || ''}
                        </span>
                      )}
                      {goal.targetDate && (
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-muted" />
                          By {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-softBorder text-xs">
                  {goal.status === 'ACTIVE' ? (
                    <button
                      onClick={() => updateGoalStatusMutation.mutate({ id: goal.id, status: 'COMPLETED' })}
                      className="text-emerald-800 font-extrabold hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Done
                    </button>
                  ) : (
                    <button
                      onClick={() => updateGoalStatusMutation.mutate({ id: goal.id, status: 'ACTIVE' })}
                      className="text-stone-600 font-bold hover:underline"
                    >
                      Reopen Goal
                    </button>
                  )}
                  <button
                    onClick={() => deleteGoalMutation.mutate(goal.id)}
                    className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION 7: CLINICAL HISTORY SUMMARY & DIRECT LINK */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-primary to-emerald-700 p-6 sm:p-8 text-white shadow-lg shadow-emerald-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Medical History Vault</h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
              View and maintain your documented allergies, chronic medical conditions, past surgical procedures, and family medical backgrounds.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {allergies.length} Allergies Documented
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {conditions.length} Medical Conditions
              </span>
            </div>
          </div>
          <Link to="/patient/medical-history">
            <Button size="md" className="bg-white text-primary-dark hover:bg-emerald-50 font-black shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Medical History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
