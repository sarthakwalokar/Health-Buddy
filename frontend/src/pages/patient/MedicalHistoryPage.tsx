import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../../api/patientApi';
import {
  PatientAllergy,
  CreateAllergyRequest,
  AllergySeverity,
  AllergyStatus,
  PatientCondition,
  CreateConditionRequest,
  ConditionStatus,
  ConditionSource,
  PatientSurgery,
  CreateSurgeryRequest,
  PatientFamilyHistory,
  CreateFamilyHistoryRequest,
  FamilyRelationship,
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { HealthTimeline } from '../../components/timeline/HealthTimeline';
import {
  ShieldAlert,
  Heart,
  Scissors,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Calendar,
  Building2,
  Info,
  Stethoscope,
  UserCheck,
  Sparkles,
  X,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '../../utils/cn';

type TabKey = 'overview' | 'allergies' | 'conditions' | 'surgeries' | 'family' | 'timeline';

export const MedicalHistoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const { data: allergiesData, isLoading: isAllergiesLoading } = useQuery({
    queryKey: ['patientAllergies'],
    queryFn: () => patientApi.getAllergies(),
  });

  const { data: conditionsData, isLoading: isConditionsLoading } = useQuery({
    queryKey: ['patientConditions'],
    queryFn: () => patientApi.getConditions(),
  });

  const { data: surgeriesData, isLoading: isSurgeriesLoading } = useQuery({
    queryKey: ['patientSurgeries'],
    queryFn: () => patientApi.getSurgeries(),
  });

  const { data: familyData, isLoading: isFamilyLoading } = useQuery({
    queryKey: ['patientFamilyHistory'],
    queryFn: () => patientApi.getFamilyHistory(),
  });

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['patientTimeline'],
    queryFn: () => patientApi.getTimeline(),
  });

  const allergies = allergiesData?.data || [];
  const conditions = conditionsData?.data || [];
  const surgeries = surgeriesData?.data || [];
  const familyHistories = familyData?.data || [];
  const timelineEvents = timelineData?.data || [];

  // Active Modals / Forms
  const [activeModal, setActiveModal] = useState<
    'allergy' | 'condition' | 'surgery' | 'family' | null
  >(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Allergy Form State
  const [allergen, setAllergen] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<AllergySeverity>('MODERATE');
  const [allergyStatus, setAllergyStatus] = useState<AllergyStatus>('ACTIVE');
  const [allergyNotes, setAllergyNotes] = useState('');

  // Condition Form State
  const [conditionName, setConditionName] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [conditionStatus, setConditionStatus] = useState<ConditionStatus>('ACTIVE');
  const [conditionSource, setConditionSource] = useState<ConditionSource>('PATIENT_REPORTED');
  const [conditionNotes, setConditionNotes] = useState('');

  // Surgery Form State
  const [procedureName, setProcedureName] = useState('');
  const [dateOfSurgery, setDateOfSurgery] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [surgeryNotes, setSurgeryNotes] = useState('');

  // Family History Form State
  const [familyRelationship, setFamilyRelationship] = useState<FamilyRelationship>('FATHER');
  const [familyCondition, setFamilyCondition] = useState('');
  const [familyAgeOfOnset, setFamilyAgeOfOnset] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');

  // Mutations - Allergy
  const allergyMutation = useMutation({
    mutationFn: (data: CreateAllergyRequest) =>
      editingId ? patientApi.updateAllergy(editingId, data) : patientApi.createAllergy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAllergies'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
      closeModal();
      setSuccessMessage(editingId ? 'Allergy record updated.' : 'Allergy recorded successfully.');
    },
    onError: () => setErrorMessage('Failed to save allergy record.'),
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: (id: string) => patientApi.deleteAllergy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAllergies'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      setSuccessMessage('Allergy removed.');
    },
  });

  // Mutations - Condition
  const conditionMutation = useMutation({
    mutationFn: (data: CreateConditionRequest) =>
      editingId ? patientApi.updateCondition(editingId, data) : patientApi.createCondition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientConditions'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
      closeModal();
      setSuccessMessage(editingId ? 'Condition record updated.' : 'Condition recorded successfully.');
    },
    onError: () => setErrorMessage('Failed to save condition record.'),
  });

  const deleteConditionMutation = useMutation({
    mutationFn: (id: string) => patientApi.deleteCondition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientConditions'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      setSuccessMessage('Condition removed.');
    },
  });

  // Mutations - Surgery
  const surgeryMutation = useMutation({
    mutationFn: (data: CreateSurgeryRequest) =>
      editingId ? patientApi.updateSurgery(editingId, data) : patientApi.createSurgery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientSurgeries'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      closeModal();
      setSuccessMessage(editingId ? 'Surgical record updated.' : 'Surgical record saved.');
    },
    onError: () => setErrorMessage('Failed to save surgical record.'),
  });

  const deleteSurgeryMutation = useMutation({
    mutationFn: (id: string) => patientApi.deleteSurgery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientSurgeries'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      setSuccessMessage('Surgical record removed.');
    },
  });

  // Mutations - Family History
  const familyMutation = useMutation({
    mutationFn: (data: CreateFamilyHistoryRequest) =>
      editingId ? patientApi.updateFamilyHistory(editingId, data) : patientApi.createFamilyHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientFamilyHistory'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      closeModal();
      setSuccessMessage(editingId ? 'Family history updated.' : 'Family history recorded.');
    },
    onError: () => setErrorMessage('Failed to save family history.'),
  });

  const deleteFamilyMutation = useMutation({
    mutationFn: (id: string) => patientApi.deleteFamilyHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientFamilyHistory'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
      setSuccessMessage('Family history removed.');
    },
  });

  const closeModal = () => {
    setActiveModal(null);
    setEditingId(null);
    // Reset forms
    setAllergen('');
    setAllergyReaction('');
    setAllergySeverity('MODERATE');
    setAllergyStatus('ACTIVE');
    setAllergyNotes('');

    setConditionName('');
    setDiagnosedDate('');
    setConditionStatus('ACTIVE');
    setConditionSource('PATIENT_REPORTED');
    setConditionNotes('');

    setProcedureName('');
    setDateOfSurgery('');
    setHospitalName('');
    setSurgeryNotes('');

    setFamilyRelationship('FATHER');
    setFamilyCondition('');
    setFamilyAgeOfOnset('');
    setFamilyNotes('');
  };

  // Open Edit Modals
  const openEditAllergy = (item: PatientAllergy) => {
    setEditingId(item.id);
    setAllergen(item.allergen);
    setAllergyReaction(item.reaction || '');
    setAllergySeverity(item.severity);
    setAllergyStatus(item.status);
    setAllergyNotes(item.notes || '');
    setActiveModal('allergy');
  };

  const openEditCondition = (item: PatientCondition) => {
    setEditingId(item.id);
    setConditionName(item.conditionName);
    setDiagnosedDate(item.diagnosedDate || '');
    setConditionStatus(item.status);
    setConditionSource(item.source);
    setConditionNotes(item.notes || '');
    setActiveModal('condition');
  };

  const openEditSurgery = (item: PatientSurgery) => {
    setEditingId(item.id);
    setProcedureName(item.procedureName);
    setDateOfSurgery(item.dateOfSurgery || '');
    setHospitalName(item.hospitalName || '');
    setSurgeryNotes(item.notes || '');
    setActiveModal('surgery');
  };

  const openEditFamily = (item: PatientFamilyHistory) => {
    setEditingId(item.id);
    setFamilyRelationship(item.relationship);
    setFamilyCondition(item.condition);
    setFamilyAgeOfOnset(item.ageOfOnset ? String(item.ageOfOnset) : '');
    setFamilyNotes(item.notes || '');
    setActiveModal('family');
  };

  const getSourceBadge = (source: ConditionSource | string) => {
    switch (source) {
      case 'DOCTOR_REPORTED':
      case 'DOCTOR_REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Stethoscope className="w-3 h-3 text-emerald-700" />
            Doctor reviewed
          </span>
        );
      case 'IMPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-stone-100 text-stone-800 border border-stone-200">
            <Sparkles className="w-3 h-3 text-stone-600" />
            Imported record
          </span>
        );
      case 'PATIENT_REPORTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-stone-100 text-stone-800 border border-stone-200">
            <UserCheck className="w-3 h-3 text-stone-600" />
            Patient reported
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: AllergySeverity) => {
    switch (severity) {
      case 'SEVERE':
        return <Badge variant="danger" size="sm">Severe</Badge>;
      case 'MODERATE':
        return <Badge variant="amber" size="sm">Moderate</Badge>;
      case 'MILD':
        return <Badge variant="primary" size="sm">Mild</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Unknown</Badge>;
    }
  };

  const isLoading =
    isAllergiesLoading ||
    isConditionsLoading ||
    isSurgeriesLoading ||
    isFamilyLoading ||
    isTimelineLoading;

  if (isLoading) {
    return (
      <LoadingState
        message="Loading clinical history..."
        subMessage="Querying patient allergy, condition, surgery, and family records"
      />
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">Medical History</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                Clinical Vault
              </span>
            </div>
            <p className="text-sm text-muted mt-1 font-medium">
              Documented allergies, diagnosed conditions, surgical interventions, and family health factors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-extrabold border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Patient-Managed Record
            </span>
          </div>
        </div>

        {/* Clinical Safety Notice */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border border-amber-200/90 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
            <strong className="font-extrabold text-amber-950">Medical Provenance & Verification:</strong> All entries are tagged with their origin (e.g. "Patient reported" or "Doctor reviewed"). Health Buddy presents documented data for tele-connectivity and does not automatically infer genetic risks or diagnoses.
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

      {/* Radiant Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200 shadow-inner">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150',
            activeTab === 'overview'
              ? 'bg-white text-primary-dark shadow-sm ring-1 ring-stone-200'
              : 'text-charcoal hover:text-primary-dark hover:bg-white/50'
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('allergies')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150',
            activeTab === 'allergies'
              ? 'bg-white text-amber-900 shadow-sm ring-1 ring-amber-200'
              : 'text-charcoal hover:text-amber-800 hover:bg-white/50'
          )}
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Allergies ({allergies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conditions')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150',
            activeTab === 'conditions'
              ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200'
              : 'text-charcoal hover:text-emerald-800 hover:bg-white/50'
          )}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Conditions ({conditions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('surgeries')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150',
            activeTab === 'surgeries'
              ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
              : 'text-charcoal hover:text-stone-900 hover:bg-white/50'
          )}
        >
          <Scissors className="w-4 h-4 text-stone-700" />
          <span>Surgeries ({surgeries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150',
            activeTab === 'family'
              ? 'bg-white text-teal-900 shadow-sm ring-1 ring-teal-200'
              : 'text-charcoal hover:text-teal-800 hover:bg-white/50'
          )}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Family History ({familyHistories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150',
            activeTab === 'timeline'
              ? 'bg-white text-primary-dark shadow-sm ring-1 ring-stone-200'
              : 'text-charcoal hover:text-primary-dark hover:bg-white/50'
          )}
        >
          <Clock className="w-4 h-4 text-primary" />
          <span>Timeline ({timelineEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('allergies')}
              className="p-5 bg-gradient-to-br from-white via-white to-amber-50/50 rounded-2xl border border-amber-200/80 hover:border-amber-400 hover:shadow-card cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider">Allergies</span>
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-charcoal mt-2">{allergies.length}</div>
              <span className="text-xs font-bold text-amber-800">
                {allergies.filter((a) => a.severity === 'SEVERE').length} severe recorded
              </span>
            </div>

            <div
              onClick={() => setActiveTab('conditions')}
              className="p-5 bg-gradient-to-br from-white via-white to-emerald-50/50 rounded-2xl border border-emerald-200/80 hover:border-emerald-400 hover:shadow-card cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Conditions</span>
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div className="text-3xl font-black text-charcoal mt-2">{conditions.length}</div>
              <span className="text-xs font-bold text-emerald-800">
                {conditions.filter((c) => c.status === 'ACTIVE').length} active conditions
              </span>
            </div>

            <div
              onClick={() => setActiveTab('surgeries')}
              className="p-5 bg-gradient-to-br from-white via-white to-stone-50 rounded-2xl border border-stone-200 hover:border-stone-400 hover:shadow-card cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">Surgeries</span>
                <Scissors className="w-5 h-5 text-stone-700" />
              </div>
              <div className="text-3xl font-black text-charcoal mt-2">{surgeries.length}</div>
              <span className="text-xs font-bold text-muted">Procedures logged</span>
            </div>

            <div
              onClick={() => setActiveTab('family')}
              className="p-5 bg-gradient-to-br from-white via-white to-teal-50/50 rounded-2xl border border-teal-200/80 hover:border-teal-400 hover:shadow-card cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-900 uppercase tracking-wider">Family</span>
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-3xl font-black text-charcoal mt-2">{familyHistories.length}</div>
              <span className="text-xs font-bold text-teal-800">Relative records</span>
            </div>
          </div>

          {/* Chronological Timeline Preview */}
          <Card className="p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-softBorder pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-primary shadow-xs">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Recent Health Events</h3>
                  <p className="text-xs text-muted font-medium">Chronological timeline of documented medical history</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('timeline')}>
                View Full Timeline
              </Button>
            </div>
            <HealthTimeline events={timelineEvents.slice(0, 5)} isLoading={isTimelineLoading} />
          </Card>
        </div>
      )}

      {/* TAB 2: ALLERGIES */}
      {activeTab === 'allergies' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal">Documented Allergies</h3>
              <p className="text-xs sm:text-sm text-muted font-medium">Substances that trigger allergic or adverse reactions</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                closeModal();
                setActiveModal('allergy');
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Allergy
            </Button>
          </div>

          {allergies.length === 0 ? (
            <EmptyState
              title="No allergies have been added yet"
              description="Documenting food, drug, or environmental sensitivities helps clinical teams safeguard your care."
              icon={<ShieldAlert className="w-6 h-6 text-muted" />}
              actionLabel="Record Allergy"
              onAction={() => {
                closeModal();
                setActiveModal('allergy');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allergies.map((allergy) => (
                <Card key={allergy.id} className="p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-amber-50/20 border-amber-200/70 hover:border-amber-400 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-charcoal">{allergy.allergen}</h4>
                        {allergy.reaction && (
                          <p className="text-xs text-muted font-semibold mt-0.5">Reaction: {allergy.reaction}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getSeverityBadge(allergy.severity)}
                        <Badge variant={allergy.status === 'ACTIVE' ? 'primary' : 'neutral'} size="sm">
                          {allergy.status}
                        </Badge>
                      </div>
                    </div>
                    {allergy.notes && (
                      <p className="text-xs text-muted font-medium bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                        "{allergy.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-softBorder text-xs text-muted font-semibold">
                    <span>Recorded {new Date(allergy.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditAllergy(allergy)}
                        className="p-1.5 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Allergy"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAllergyMutation.mutate(allergy.id)}
                        className="p-1.5 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                        title="Delete Allergy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONDITIONS */}
      {activeTab === 'conditions' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal">Medical & Chronic Conditions</h3>
              <p className="text-xs sm:text-sm text-muted font-medium">Diagnosed health conditions and long-term health statuses</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                closeModal();
                setActiveModal('condition');
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Condition
            </Button>
          </div>

          {conditions.length === 0 ? (
            <EmptyState
              title="No conditions recorded"
              description="Keep a record of active or past diagnosed conditions (e.g. Hypertension, Asthma, Diabetes)."
              icon={<Heart className="w-6 h-6 text-muted" />}
              actionLabel="Add Condition"
              onAction={() => {
                closeModal();
                setActiveModal('condition');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {conditions.map((condition) => (
                <Card key={condition.id} className="p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-emerald-50/20 border-emerald-100 hover:border-emerald-300 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-charcoal">{condition.conditionName}</h4>
                        {condition.diagnosedDate && (
                          <div className="flex items-center gap-1 text-xs text-muted font-semibold mt-1">
                            <Calendar className="w-3.5 h-3.5 text-muted" />
                            Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant={condition.status === 'ACTIVE' ? 'primary' : 'neutral'} size="sm">
                          {condition.status}
                        </Badge>
                        {getSourceBadge(condition.source)}
                      </div>
                    </div>
                    {condition.notes && (
                      <p className="text-xs text-muted font-medium bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        {condition.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-softBorder text-xs text-muted font-semibold">
                    <span>Logged {new Date(condition.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCondition(condition)}
                        className="p-1.5 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Condition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteConditionMutation.mutate(condition.id)}
                        className="p-1.5 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                        title="Delete Condition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SURGERIES */}
      {activeTab === 'surgeries' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal">Surgical History</h3>
              <p className="text-xs sm:text-sm text-muted font-medium">Past surgical procedures and medical interventions</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                closeModal();
                setActiveModal('surgery');
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Surgical Record
            </Button>
          </div>

          {surgeries.length === 0 ? (
            <EmptyState
              title="No surgical history recorded"
              description="Document past operations, procedures, or hospitalizations for accurate clinical context."
              icon={<Scissors className="w-6 h-6 text-muted" />}
              actionLabel="Add Surgery"
              onAction={() => {
                closeModal();
                setActiveModal('surgery');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {surgeries.map((surgery) => (
                <Card key={surgery.id} className="p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-stone-50 border-stone-200 hover:border-stone-300 transition-colors">
                  <div className="space-y-2.5">
                    <div>
                      <h4 className="font-extrabold text-base text-charcoal">{surgery.procedureName}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-semibold mt-1">
                        {surgery.dateOfSurgery && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted" />
                            {new Date(surgery.dateOfSurgery).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                        {surgery.hospitalName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-muted" />
                            {surgery.hospitalName}
                          </span>
                        )}
                      </div>
                    </div>
                    {surgery.notes && (
                      <p className="text-xs text-muted font-medium bg-white p-2.5 rounded-xl border border-stone-200">
                        {surgery.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-softBorder text-xs text-muted font-semibold">
                    <span>Logged {new Date(surgery.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSurgery(surgery)}
                        className="p-1.5 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Surgery"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSurgeryMutation.mutate(surgery.id)}
                        className="p-1.5 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                        title="Delete Surgery"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FAMILY HISTORY */}
      {activeTab === 'family' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal">Family Medical History</h3>
              <p className="text-xs sm:text-sm text-muted font-medium">Health conditions observed in immediate and extended family</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                closeModal();
                setActiveModal('family');
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Family History
            </Button>
          </div>

          {familyHistories.length === 0 ? (
            <EmptyState
              title="No family medical history recorded"
              description="Record hereditary or family conditions (e.g. cardiac conditions in parents or siblings) for health planning."
              icon={<Users className="w-6 h-6 text-muted" />}
              actionLabel="Add Family History"
              onAction={() => {
                closeModal();
                setActiveModal('family');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyHistories.map((fh) => (
                <Card key={fh.id} className="p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-teal-50/20 border-teal-100 hover:border-teal-300 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-charcoal">{fh.condition}</h4>
                        <span className="text-xs font-bold text-teal-800">
                          Relationship: {fh.relationship}
                        </span>
                      </div>
                      {fh.ageOfOnset && (
                        <Badge variant="amber" size="sm">
                          Onset: Age {fh.ageOfOnset}
                        </Badge>
                      )}
                    </div>
                    {fh.notes && (
                      <p className="text-xs text-muted font-medium bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        {fh.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-softBorder text-xs text-muted font-semibold">
                    <span>Logged {new Date(fh.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditFamily(fh)}
                        className="p-1.5 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFamilyMutation.mutate(fh.id)}
                        className="p-1.5 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: TIMELINE FOUNDATION */}
      {activeTab === 'timeline' && (
        <Card className="p-6 sm:p-7">
          <div className="border-b border-softBorder pb-4 mb-6">
            <h3 className="text-lg font-bold text-charcoal">Patient Health Timeline Foundation</h3>
            <p className="text-xs sm:text-sm text-muted font-medium">
              Chronological aggregation of documented health milestones, conditions, allergies, and lifestyle updates.
            </p>
          </div>
          <HealthTimeline events={timelineEvents} isLoading={isTimelineLoading} />
        </Card>
      )}

      {/* ================= MODAL / DRAWER FORMS ================= */}

      {/* 1. ALLERGY FORM MODAL */}
      {activeModal === 'allergy' && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-softBorder max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-softBorder pb-3">
              <h3 className="font-black text-lg text-charcoal">
                {editingId ? 'Edit Allergy Record' : 'Record New Allergy'}
              </h3>
              <button onClick={closeModal} className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!allergen.trim()) return;
                allergyMutation.mutate({
                  allergen: allergen.trim(),
                  reaction: allergyReaction.trim() || undefined,
                  severity: allergySeverity,
                  status: allergyStatus,
                  notes: allergyNotes.trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <Input
                label="Allergen / Substance"
                placeholder="e.g. Penicillin, Peanuts, Latex, Dust"
                value={allergen}
                onChange={(e) => setAllergen(e.target.value)}
                required
              />

              <Input
                label="Reaction Description"
                placeholder="e.g. Skin rash, shortness of breath, hives"
                value={allergyReaction}
                onChange={(e) => setAllergyReaction(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                    Severity
                  </label>
                  <select
                    value={allergySeverity}
                    onChange={(e) => setAllergySeverity(e.target.value as AllergySeverity)}
                    className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                    Status
                  </label>
                  <select
                    value={allergyStatus}
                    onChange={(e) => setAllergyStatus(e.target.value as AllergyStatus)}
                    className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={allergyNotes}
                  onChange={(e) => setAllergyNotes(e.target.value)}
                  placeholder="Additional context or trigger circumstances..."
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-softBorder">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={allergyMutation.isPending}>
                  {editingId ? 'Update Record' : 'Save Allergy'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CONDITION FORM MODAL */}
      {activeModal === 'condition' && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-softBorder max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-softBorder pb-3">
              <h3 className="font-black text-lg text-charcoal">
                {editingId ? 'Edit Medical Condition' : 'Record Diagnosed Condition'}
              </h3>
              <button onClick={closeModal} className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!conditionName.trim()) return;
                conditionMutation.mutate({
                  conditionName: conditionName.trim(),
                  diagnosedDate: diagnosedDate || undefined,
                  status: conditionStatus,
                  source: conditionSource,
                  notes: conditionNotes.trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <Input
                label="Condition Name"
                placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                value={conditionName}
                onChange={(e) => setConditionName(e.target.value)}
                required
              />

              <Input
                label="Date of Diagnosis (Optional)"
                type="date"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                    Status
                  </label>
                  <select
                    value={conditionStatus}
                    onChange={(e) => setConditionStatus(e.target.value as ConditionStatus)}
                    className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="HISTORICAL">Historical</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                    Source
                  </label>
                  <select
                    value={conditionSource}
                    onChange={(e) => setConditionSource(e.target.value as ConditionSource)}
                    className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="PATIENT_REPORTED">Patient Reported</option>
                    <option value="DOCTOR_REPORTED">Doctor Reported</option>
                    <option value="IMPORTED">Imported</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="Details regarding management, stability, or specialist consults..."
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-softBorder">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={conditionMutation.isPending}>
                  {editingId ? 'Update Condition' : 'Save Condition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SURGERY FORM MODAL */}
      {activeModal === 'surgery' && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-softBorder max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-softBorder pb-3">
              <h3 className="font-black text-lg text-charcoal">
                {editingId ? 'Edit Surgical Record' : 'Record Surgical History'}
              </h3>
              <button onClick={closeModal} className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!procedureName.trim()) return;
                surgeryMutation.mutate({
                  procedureName: procedureName.trim(),
                  dateOfSurgery: dateOfSurgery || undefined,
                  hospitalName: hospitalName.trim() || undefined,
                  notes: surgeryNotes.trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <Input
                label="Procedure / Operation Name"
                placeholder="e.g. Appendectomy, Knee Arthroscopy, Cataract Surgery"
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date of Surgery (Optional)"
                  type="date"
                  value={dateOfSurgery}
                  onChange={(e) => setDateOfSurgery(e.target.value)}
                />

                <Input
                  label="Hospital / Medical Center"
                  placeholder="e.g. Mass General Hospital"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Operative Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={surgeryNotes}
                  onChange={(e) => setSurgeryNotes(e.target.value)}
                  placeholder="Any surgical complications or recovery details..."
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-softBorder">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={surgeryMutation.isPending}>
                  {editingId ? 'Update Surgery' : 'Save Surgery'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. FAMILY HISTORY FORM MODAL */}
      {activeModal === 'family' && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-softBorder max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-softBorder pb-3">
              <h3 className="font-black text-lg text-charcoal">
                {editingId ? 'Edit Family History' : 'Record Family Medical History'}
              </h3>
              <button onClick={closeModal} className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!familyCondition.trim()) return;
                const age = familyAgeOfOnset ? parseInt(familyAgeOfOnset, 10) : undefined;
                familyMutation.mutate({
                  relationship: familyRelationship,
                  condition: familyCondition.trim(),
                  ageOfOnset: isNaN(age!) ? undefined : age,
                  notes: familyNotes.trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                    Relationship
                  </label>
                  <select
                    value={familyRelationship}
                    onChange={(e) => setFamilyRelationship(e.target.value as FamilyRelationship)}
                    className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="GRANDPARENT">Grandparent</option>
                    <option value="CHILD">Child</option>
                    <option value="OTHER">Other Relative</option>
                  </select>
                </div>

                <Input
                  label="Approx. Age of Onset"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g. 52"
                  value={familyAgeOfOnset}
                  onChange={(e) => setFamilyAgeOfOnset(e.target.value)}
                />
              </div>

              <Input
                label="Condition / Illness"
                placeholder="e.g. Coronary Artery Disease, Early-onset Glaucoma"
                value={familyCondition}
                onChange={(e) => setFamilyCondition(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal tracking-wide uppercase">
                  Family Context Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={familyNotes}
                  onChange={(e) => setFamilyNotes(e.target.value)}
                  placeholder="Additional family lineage or clinical history context..."
                  className="block w-full rounded-xl border border-softBorder bg-surface px-3.5 py-2 text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-softBorder">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={familyMutation.isPending}>
                  {editingId ? 'Update Record' : 'Save Family History'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
