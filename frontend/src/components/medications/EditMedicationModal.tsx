import React, { useState, useEffect } from 'react';
import {
  X,
  Pill,
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Bell,
  ShieldAlert
} from 'lucide-react';
import {
  MedicationResponse,
  UpdateMedicationRequest,
  MedicationRoute,
  FrequencyType,
  ScheduleType,
  MedicationScheduleRequest,
  MedicationStatus
} from '../../types/medication';

interface EditMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateMedicationRequest) => Promise<void>;
  medication: MedicationResponse | null;
  isLoading?: boolean;
}

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  medication,
  isLoading = false
}) => {
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageAmount, setDosageAmount] = useState<number>(1);
  const [dosageUnit, setDosageUnit] = useState('tablet');
  const [route, setRoute] = useState<MedicationRoute>(MedicationRoute.ORAL);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(FrequencyType.ONCE_DAILY);
  const [frequencyValue, setFrequencyValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [reason, setReason] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<MedicationStatus>(MedicationStatus.ACTIVE);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(15);

  const [schedules, setSchedules] = useState<MedicationScheduleRequest[]>([
    { scheduleType: ScheduleType.FIXED_TIME, timeOfDay: '08:00', doseAmount: 1, doseUnit: 'tablet' }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (medication) {
      setMedicineName(medication.medicineName || '');
      setGenericName(medication.genericName || '');
      setStrength(medication.strength || '');
      setDosageAmount(medication.dosageAmount || 1);
      setDosageUnit(medication.dosageUnit || 'tablet');
      setRoute(medication.route || MedicationRoute.ORAL);
      setFrequencyType(medication.frequencyType || FrequencyType.ONCE_DAILY);
      setFrequencyValue(medication.frequencyValue || '');
      setStartDate(medication.startDate || '');
      setEndDate(medication.endDate || '');
      setInstructions(medication.instructions || '');
      setReason(medication.reason || '');
      setPrescribedBy(medication.prescribedBy || '');
      setNotes(medication.notes || '');
      setStatus(medication.status || MedicationStatus.ACTIVE);
      setReminderEnabled(medication.reminderEnabled ?? true);
      setReminderMinutesBefore(medication.reminderMinutesBefore ?? 15);

      if (medication.schedules && medication.schedules.length > 0) {
        setSchedules(
          medication.schedules.map((s) => ({
            scheduleType: s.scheduleType,
            timeOfDay: s.timeOfDay ? s.timeOfDay.substring(0, 5) : '08:00',
            daysOfWeek: s.daysOfWeek,
            intervalHours: s.intervalHours,
            doseAmount: s.doseAmount || medication.dosageAmount,
            doseUnit: s.doseUnit || medication.dosageUnit
          }))
        );
      }
    }
  }, [medication]);

  if (!isOpen || !medication) return null;

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        scheduleType: ScheduleType.FIXED_TIME,
        timeOfDay: '12:00',
        doseAmount: dosageAmount || 1,
        doseUnit: dosageUnit || 'tablet'
      }
    ]);
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: keyof MedicationScheduleRequest, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    if (dosageAmount <= 0) {
      newErrors.dosageAmount = 'Dosage amount must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: UpdateMedicationRequest = {
      medicineName: medicineName.trim(),
      genericName: genericName.trim() || undefined,
      strength: strength.trim() || undefined,
      dosageAmount,
      dosageUnit: dosageUnit.trim() || 'tablet',
      route,
      frequencyType,
      frequencyValue: frequencyValue.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      instructions: instructions.trim() || undefined,
      reason: reason.trim() || undefined,
      prescribedBy: prescribedBy.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      reminderEnabled,
      reminderMinutesBefore,
      schedules: frequencyType !== FrequencyType.AS_NEEDED ? schedules : []
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message || err.message || 'Failed to update medication record' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-med-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-orange-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-pink-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="edit-med-title" className="text-xl font-bold tracking-tight">
                Edit Medication Record
              </h2>
              <p className="text-xs text-orange-100">
                Update details for your personal medication tracking log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start space-x-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Patient Tracking Notice:</span> Health Buddy records the medications you report. Do not adjust your clinical dosage, frequency, or schedule without consulting your licensed healthcare provider.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Pill className="w-4 h-4 text-orange-600" />
              <span>Medication Identification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g., Metformin, Lisinopril, Lipitor"
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                    errors.medicineName ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition`}
                />
                {errors.medicineName && <p className="text-xs text-red-500 mt-1">{errors.medicineName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Generic / Active Ingredient (Optional)
                </label>
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g., Metformin HCl, Atorvastatin"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Strength
                </label>
                <input
                  type="text"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="e.g., 500 mg, 10 mg/mL"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dosage Amount per Intake <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={dosageAmount}
                  onChange={(e) => setDosageAmount(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={dosageUnit}
                  onChange={(e) => setDosageUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                >
                  <option value="tablet">tablet(s)</option>
                  <option value="capsule">capsule(s)</option>
                  <option value="mg">mg</option>
                  <option value="mL">mL</option>
                  <option value="drops">drops</option>
                  <option value="puffs">puffs</option>
                  <option value="patch">patch</option>
                  <option value="units">units</option>
                  <option value="application">application</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Route of Administration
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value as MedicationRoute)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                >
                  <option value={MedicationRoute.ORAL}>Oral (Swallow / Chew)</option>
                  <option value={MedicationRoute.TOPICAL}>Topical (Skin)</option>
                  <option value={MedicationRoute.INHALATION}>Inhalation (Inhaler / Nebulizer)</option>
                  <option value={MedicationRoute.INJECTION}>Injection (SubQ / IM / IV)</option>
                  <option value={MedicationRoute.OPHTHALMIC}>Ophthalmic (Eye Drops)</option>
                  <option value={MedicationRoute.OTIC}>Otic (Ear Drops)</option>
                  <option value={MedicationRoute.NASAL}>Nasal (Nose Spray)</option>
                  <option value={MedicationRoute.OTHER}>Other</option>
                  <option value={MedicationRoute.UNKNOWN}>Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MedicationStatus)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                >
                  <option value={MedicationStatus.ACTIVE}>Active</option>
                  <option value={MedicationStatus.PAUSED}>Paused</option>
                  <option value={MedicationStatus.COMPLETED}>Completed</option>
                  <option value={MedicationStatus.STOPPED}>Stopped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Frequency & Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Clock className="w-4 h-4 text-pink-700" />
              <span>Frequency & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Frequency Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={frequencyType}
                  onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                >
                  <option value={FrequencyType.ONCE_DAILY}>Once daily</option>
                  <option value={FrequencyType.TWICE_DAILY}>Twice daily</option>
                  <option value={FrequencyType.THREE_TIMES_DAILY}>3 times daily</option>
                  <option value={FrequencyType.FOUR_TIMES_DAILY}>4 times daily</option>
                  <option value={FrequencyType.EVERY_X_HOURS}>Every X hours</option>
                  <option value={FrequencyType.WEEKLY}>Weekly</option>
                  <option value={FrequencyType.AS_NEEDED}>As Needed (PRN)</option>
                  <option value={FrequencyType.CUSTOM}>Custom Schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Additional Frequency Notes (Optional)
                </label>
                <input
                  type="text"
                  value={frequencyValue}
                  onChange={(e) => setFrequencyValue(e.target.value)}
                  placeholder="e.g., Before breakfast and dinner"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Schedule Times List */}
            {frequencyType !== FrequencyType.AS_NEEDED && (
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span>Intake Schedule Times</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center space-x-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Time</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {schedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 bg-white p-2.5 rounded-lg border border-orange-200/80 shadow-sm"
                    >
                      <span className="text-xs font-bold text-gray-500 w-6 text-center">#{idx + 1}</span>
                      <div className="flex-1">
                        <input
                          type="time"
                          value={schedule.timeOfDay || '08:00'}
                          onChange={(e) => handleScheduleChange(idx, 'timeOfDay', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={schedule.doseAmount || dosageAmount}
                          onChange={(e) =>
                            handleScheduleChange(idx, 'doseAmount', parseFloat(e.target.value) || 1)
                          }
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none"
                          placeholder="Amount"
                        />
                      </div>
                      <span className="text-xs text-gray-500">{dosageUnit}</span>
                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(idx)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                          title="Remove time"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Dates & Instructions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Dates, Instructions & Clinical Context</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                    errors.startDate ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition`}
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date (Optional, leave blank if ongoing)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                    errors.endDate ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition`}
                />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Instructions / Direction for Use
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Take with a full glass of water with food. Do not crush."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Taking (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Type 2 Diabetes, High Blood Pressure"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prescribing Physician / Clinic (Optional)
                </label>
                <input
                  type="text"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  placeholder="e.g., Dr. Jane Smith, City Health Center"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Personal Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Personal observations, side effects noted, storage instructions..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section 4: Reminders */}
          <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-pink-700" />
                <span className="text-xs font-bold text-gray-900">In-App Dose Reminders</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-700"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs text-gray-700">Alert me</span>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-white border border-pink-200 rounded-lg text-xs font-medium text-pink-950 focus:outline-none focus:ring-1 focus:ring-pink-600"
                >
                  <option value={0}>At scheduled time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
                <span className="text-xs text-gray-500">before each dose</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-pink-700 hover:from-orange-700 hover:to-pink-800 text-white text-sm font-semibold shadow-md shadow-orange-500/20 disabled:opacity-50 transition"
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
