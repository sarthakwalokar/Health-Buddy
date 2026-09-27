import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pill,
  Clock,
  Calendar,
  ChevronLeft,
  Edit3,
  Pause,
  Play,
  CheckCircle2,
  Square,
  Trash2,
  Bell,
  AlertCircle,
  ShieldAlert,
  X,
  TrendingUp
} from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import {
  MedicationStatus,
  UpdateMedicationRequest,
  DoseStatus,
  MedicationSchedule,
  MedicationDoseResponse
} from '../../types/medication';
import { EditMedicationModal } from '../../components/medications/EditMedicationModal';
import { ActionConfirmationDialog } from '../../components/medications/ActionConfirmationDialog';

export const MedicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch Medication Detail
  const { data: medication, isLoading, error } = useQuery({
    queryKey: ['patient-medication', id],
    queryFn: () => medicationApi.getMedicationById(id!),
    enabled: !!id
  });

  // Fetch Doses history for this medication
  const { data: dosesData, isLoading: isDosesLoading } = useQuery({
    queryKey: ['patient-medication-doses', id],
    queryFn: () => medicationApi.getDoses({ medicationId: id, size: 20 }),
    enabled: !!id
  });

  // Fetch Adherence for this medication
  const { data: adherenceData } = useQuery({
    queryKey: ['patient-medication-adherence', id],
    queryFn: () => medicationApi.getAdherence({ medicationId: id, period: '30_DAYS' }),
    enabled: !!id
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: UpdateMedicationRequest) => medicationApi.updateMedication(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const pauseMutation = useMutation({
    mutationFn: () => medicationApi.pauseMedication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: () => medicationApi.resumeMedication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medication-doses', id] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => medicationApi.completeMedication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => medicationApi.stopMedication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => medicationApi.deleteMedication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      navigate('/patient/medications');
    }
  });

  const markDoseTakenMutation = useMutation({
    mutationFn: (doseId: string) => medicationApi.markDoseTaken(doseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication-doses', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medication-adherence', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const markDoseSkippedMutation = useMutation({
    mutationFn: (doseId: string) => medicationApi.markDoseSkipped(doseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medication-doses', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medication', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medication-adherence', id] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const handleAction = async (actionFn: () => Promise<any>) => {
    try {
      setIsActionLoading(true);
      await actionFn();
      setActiveDialog(null);
    } catch (err) {
      console.error('Operation failed', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-48 bg-white rounded-3xl border border-gray-100 p-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-gray-100"></div>
          <div className="h-72 bg-white rounded-2xl border border-gray-100"></div>
        </div>
      </div>
    );
  }

  if (error || !medication) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Medication record not found</h2>
        <p className="text-xs text-gray-500">
          The requested medication record could not be found or you do not have permission to view it.
        </p>
        <Link
          to="/patient/medications"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Medications</span>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: MedicationStatus) => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active Record</span>
          </span>
        );
      case MedicationStatus.PAUSED:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Pause className="w-3.5 h-3.5" />
            <span>Tracking Paused</span>
          </span>
        );
      case MedicationStatus.COMPLETED:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Treatment Completed</span>
          </span>
        );
      case MedicationStatus.STOPPED:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800">
            <Square className="w-3.5 h-3.5" />
            <span>Record Stopped</span>
          </span>
        );
    }
  };

  const adherence = adherenceData?.overallAdherencePercentage ?? medication.adherenceRate ?? 100;
  const recentDoses = dosesData?.content || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Back link */}
      <div>
        <Link
          to="/patient/medications"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Medications</span>
        </Link>
      </div>

      {/* Hero Detail Card */}
      <div className="bg-white rounded-3xl border border-orange-100/90 shadow-sm p-6 sm:p-8 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Pill className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {medication.medicineName}
                </h1>
                {getStatusBadge(medication.status)}
              </div>
              {medication.genericName && (
                <p className="text-sm font-medium text-gray-500">
                  Active Ingredient: <span className="text-gray-800">{medication.genericName}</span>
                </p>
              )}
              {medication.strength && (
                <p className="text-xs font-semibold text-orange-700">{medication.strength}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>

            {medication.status === MedicationStatus.ACTIVE && (
              <button
                type="button"
                onClick={() => setActiveDialog('pause')}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            {medication.status === MedicationStatus.PAUSED && (
              <button
                type="button"
                onClick={() => setActiveDialog('resume')}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            {medication.status === MedicationStatus.ACTIVE && (
              <button
                type="button"
                onClick={() => setActiveDialog('complete')}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>
            )}

            {medication.status === MedicationStatus.ACTIVE && (
              <button
                type="button"
                onClick={() => setActiveDialog('stop')}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveDialog('delete')}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center space-x-1"
              title="Delete medication record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">Patient Information Notice:</span> This record represents personal tracking information entered by you. It is not an electronic medical prescription. Do not stop or modify your clinical therapy without guidance from your healthcare provider.
          </p>
        </div>
      </div>

      {/* Main Grid: Details + Schedule & Adherence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Medication Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinical & Dosage Details */}
          <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Pill className="w-4 h-4 text-orange-600" />
              <span>Medication & Dosage Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Dosage Amount per Intake
                </span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {medication.dosageAmount} {medication.dosageUnit || 'tablet'}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Route of Administration
                </span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block capitalize">
                  {medication.route ? medication.route.toLowerCase() : 'Unknown'}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Frequency Regimen
                </span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block capitalize">
                  {medication.frequencyType ? medication.frequencyType.replace(/_/g, ' ').toLowerCase() : 'Custom'}
                </span>
                {medication.frequencyValue && (
                  <span className="text-gray-500 italic block mt-0.5">{medication.frequencyValue}</span>
                )}
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Schedule Duration
                </span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {medication.startDate} to {medication.endDate || 'Ongoing / Indefinite'}
                </span>
              </div>
            </div>

            {/* Instructions */}
            {medication.instructions && (
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs">
                <span className="font-bold text-orange-950 block mb-1">
                  Intake Directions / Instructions:
                </span>
                <p className="text-orange-900 leading-relaxed">{medication.instructions}</p>
              </div>
            )}

            {/* Context: Prescriber & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Reason for Taking
                </span>
                <span className="font-medium text-gray-800 mt-0.5 block">
                  {medication.reason || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Reported Prescriber
                </span>
                <span className="font-medium text-gray-800 mt-0.5 block">
                  {medication.prescribedBy || 'Self / Patient Reported'}
                </span>
              </div>
            </div>

            {/* Personal Notes */}
            {medication.notes && (
              <div className="pt-2">
                <span className="text-gray-400 block font-semibold uppercase text-[10px] mb-1">
                  Personal Notes
                </span>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {medication.notes}
                </p>
              </div>
            )}
          </div>

          {/* Intake Schedules */}
          <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Clock className="w-4 h-4 text-pink-700" />
              <span>Configured Daily Intake Times</span>
            </h3>

            {medication.schedules && medication.schedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medication.schedules.map((schedule: MedicationSchedule, idx: number) => (
                  <div
                    key={schedule.id || idx}
                    className="p-3.5 bg-pink-50/40 rounded-xl border border-pink-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-pink-100 text-pink-700 font-bold text-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-pink-950 block">
                          {schedule.timeOfDay ? schedule.timeOfDay.substring(0, 5) : 'Scheduled Time'}
                        </span>
                        <span className="text-[11px] text-pink-800">
                          Dose: {schedule.doseAmount || medication.dosageAmount}{' '}
                          {schedule.doseUnit || medication.dosageUnit}
                        </span>
                      </div>
                    </div>

                    {schedule.daysOfWeek && (
                      <span className="text-[10px] font-semibold text-pink-700 bg-white px-2 py-1 rounded-md border border-pink-200">
                        {schedule.daysOfWeek}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-3">
                No fixed daily schedule configured (e.g. As-Needed PRN regimen).
              </p>
            )}
          </div>

          {/* Recent Dose Logs */}
          <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Recent Dose History</span>
              </h3>
            </div>

            {isDosesLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-lg"></div>
                <div className="h-10 bg-gray-100 rounded-lg"></div>
              </div>
            ) : recentDoses.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">
                No dose entries logged yet for this medication.
              </p>
            ) : (
              <div className="space-y-2">
                {recentDoses.map((dose: MedicationDoseResponse) => {
                  const isTaken = dose.status === DoseStatus.TAKEN;
                  const isSkipped = dose.status === DoseStatus.SKIPPED;
                  const isMissed = dose.status === DoseStatus.MISSED;
                  const isScheduled = dose.status === DoseStatus.SCHEDULED;

                  const dateStr = new Date(dose.scheduledAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  });
                  const timeStr = new Date(dose.scheduledAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={dose.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-700">{dateStr} at {timeStr}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {dose.formattedDosage || `${dose.doseAmount || medication.dosageAmount} ${dose.doseUnit || medication.dosageUnit}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isTaken && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Taken</span>
                          </span>
                        )}
                        {isSkipped && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-semibold bg-gray-200 text-gray-700 text-[11px]">
                            <X className="w-3 h-3" />
                            <span>Skipped</span>
                          </span>
                        )}
                        {isMissed && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-800 text-[11px]">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Missed</span>
                          </span>
                        )}
                        {isScheduled && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => markDoseSkippedMutation.mutate(dose.id)}
                              className="px-2.5 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold"
                            >
                              Skip
                            </button>
                            <button
                              type="button"
                              onClick={() => markDoseTakenMutation.mutate(dose.id)}
                              className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-semibold"
                            >
                              Take
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Adherence Card & Reminders Status */}
        <div className="space-y-6">
          {/* Adherence Summary Card */}
          <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-3">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>30-Day Adherence</span>
            </h3>

            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-orange-100 to-pink-100 border-4 border-orange-500/20">
                <span className="text-2xl font-extrabold text-orange-950">{adherence}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Logged Intakes vs Schedule</p>
            </div>

            <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 text-center">
              <Link
                to="/patient/medications/adherence"
                className="text-orange-600 hover:text-pink-700 font-semibold hover:underline"
              >
                View Full Adherence Analytics →
              </Link>
            </div>
          </div>

          {/* Reminder Settings Card */}
          <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Bell className="w-4 h-4 text-pink-700" />
              <span>Reminder Settings</span>
            </h3>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">In-App Notifications:</span>
              <span className="font-bold text-gray-900">
                {medication.reminderEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {medication.reminderEnabled && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Lead Time:</span>
                <span className="font-bold text-pink-700">
                  {medication.reminderMinutesBefore === 0
                    ? 'At scheduled time'
                    : `${medication.reminderMinutesBefore} minutes before`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMedicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        medication={medication}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync(data);
        }}
        isLoading={updateMutation.isPending}
      />

      {/* Lifecycle Confirmation Modals */}
      <ActionConfirmationDialog
        isOpen={activeDialog === 'pause'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(() => pauseMutation.mutateAsync())}
        title="Pause Medication Tracking?"
        description="This will pause tracking for this medication record in Health Buddy. Active scheduled dose reminders will be put on hold until you resume tracking."
        confirmText="Pause Record"
        confirmVariant="warning"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'resume'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(() => resumeMutation.mutateAsync())}
        title="Resume Medication Tracking?"
        description="This will reactivate tracking and schedule upcoming reminders for this medication record in Health Buddy."
        confirmText="Resume Record"
        confirmVariant="primary"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'complete'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(() => completeMutation.mutateAsync())}
        title="Mark Medication Record as Completed?"
        description="This marks your completed treatment course in Health Buddy. It preserves your dose history and adherence statistics."
        confirmText="Mark Completed"
        confirmVariant="primary"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'stop'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(() => stopMutation.mutateAsync())}
        title="Stop Medication Record?"
        description="This will mark this medication record as stopped in Health Buddy. It does not change your actual clinical treatment. Always follow your healthcare professional's instructions."
        confirmText="Stop Record"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'delete'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(() => deleteMutation.mutateAsync())}
        title="Delete Medication Record?"
        description="Are you sure you want to permanently delete this medication record and its historical dose logs? This action cannot be undone."
        confirmText="Delete Record"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};
