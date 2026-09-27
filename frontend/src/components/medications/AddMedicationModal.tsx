import React, { useState } from 'react';
import {
  X,
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  CreateMedicationRequest,
  FrequencyType,
  MedicationRoute,
  MedicationSchedule,
  ScheduleType,
  MedicationSource
} from '../../types/medication';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMedicationRequest) => Promise<void>;
  isLoading?: boolean;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [medicineName, setMedicineName] = useState<string>('');
  const [genericName, setGenericName] = useState<string>('');
  const [strength, setStrength] = useState<string>('');
  const [dosageAmount, setDosageAmount] = useState<string>('1');
  const [dosageUnit, setDosageUnit] = useState<string>('tablet');
  const [route, setRoute] = useState<MedicationRoute>(MedicationRoute.ORAL);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(FrequencyType.ONCE_DAILY);
  const [frequencyValue, setFrequencyValue] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [prescribedBy, setPrescribedBy] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(15);
  const [notes, setNotes] = useState<string>('');
  const [customTimes, setCustomTimes] = useState<string[]>(['08:00']);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFrequencyChange = (freq: FrequencyType) => {
    setFrequencyType(freq);
    switch (freq) {
      case 'ONCE_DAILY':
        setCustomTimes(['08:00']);
        break;
      case 'TWICE_DAILY':
        setCustomTimes(['08:00', '20:00']);
        break;
      case 'THREE_TIMES_DAILY':
        setCustomTimes(['08:00', '14:00', '20:00']);
        break;
      case 'FOUR_TIMES_DAILY':
        setCustomTimes(['08:00', '12:00', '16:00', '20:00']);
        break;
      case 'EVERY_X_HOURS':
        setCustomTimes(['08:00', '16:00']);
        break;
      case 'AS_NEEDED':
        setCustomTimes([]);
        break;
      default:
        break;
    }
  };

  const handleAddTime = () => {
    setCustomTimes([...customTimes, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    setCustomTimes(customTimes.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...customTimes];
    updated[index] = val;
    setCustomTimes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!medicineName.trim()) {
      setError('Medicine name is required');
      return;
    }
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    if (endDate && endDate < startDate) {
      setError('End date cannot be earlier than start date');
      return;
    }

    try {
      setLoading(true);

      const schedules: MedicationSchedule[] = customTimes.map((time) => ({
        scheduleType: ScheduleType.FIXED_TIME,
        timeOfDay: time.length === 5 ? `${time}:00` : time,
        doseAmount: dosageAmount ? parseFloat(dosageAmount) : undefined,
        doseUnit: dosageUnit.trim() || undefined,
      }));

      const payload: CreateMedicationRequest = {
        medicineName: medicineName.trim(),
        genericName: genericName.trim() || undefined,
        strength: strength.trim() || undefined,
        dosageAmount: dosageAmount ? parseFloat(dosageAmount) : undefined,
        dosageUnit: dosageUnit.trim() || undefined,
        route,
        frequencyType,
        frequencyValue: frequencyValue.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
        instructions: instructions.trim() || undefined,
        reason: reason.trim() || undefined,
        prescribedBy: prescribedBy.trim() || undefined,
        source: MedicationSource.PATIENT_ENTERED,
        reminderEnabled,
        reminderMinutesBefore,
        notes: notes.trim() || undefined,
        schedules: schedules.length > 0 ? schedules : undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Add Medication</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Record medication details, schedules, and in-app reminder alerts.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-100 pb-1">
              1. Medication Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Lisinopril"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Generic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Metformin Hydrochloride"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Strength</label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg, 10 mg"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dose Amount</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="e.g. 1"
                  value={dosageAmount}
                  onChange={(e) => setDosageAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dose Unit</label>
                <select
                  value={dosageUnit}
                  onChange={(e) => setDosageUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white"
                >
                  <option value="tablet">tablet(s)</option>
                  <option value="capsule">capsule(s)</option>
                  <option value="mg">mg</option>
                  <option value="mL">mL</option>
                  <option value="puffs">puff(s)</option>
                  <option value="drops">drop(s)</option>
                  <option value="units">unit(s)</option>
                  <option value="application">application</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Route</label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value as MedicationRoute)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white"
                >
                  <option value="ORAL">Oral (by mouth)</option>
                  <option value="TOPICAL">Topical (skin / ointment)</option>
                  <option value="INJECTION">Injection</option>
                  <option value="INHALATION">Inhalation</option>
                  <option value="OPHTHALMIC">Ophthalmic (eye)</option>
                  <option value="OTIC">Otic (ear)</option>
                  <option value="NASAL">Nasal (nose spray)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  value={frequencyType}
                  onChange={(e) => handleFrequencyChange(e.target.value as FrequencyType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white font-medium"
                >
                  <option value="ONCE_DAILY">Once daily</option>
                  <option value="TWICE_DAILY">Twice daily</option>
                  <option value="THREE_TIMES_DAILY">Three times daily</option>
                  <option value="FOUR_TIMES_DAILY">Four times daily</option>
                  <option value="EVERY_X_HOURS">Every few hours</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="AS_NEEDED">As needed (PRN)</option>
                  <option value="CUSTOM">Custom schedule</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Dose Times & Schedule */}
          {frequencyType !== 'AS_NEEDED' && (
            <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Scheduled Intake Times</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-primary font-semibold text-xs flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Time
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {customTimes.map((time, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      className="focus:outline-none text-xs text-gray-900 font-bold"
                    />
                    {customTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Dates & Instructions */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-100 pb-1">
              2. Dates & Directions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  End Date <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Instructions</label>
              <input
                type="text"
                placeholder="e.g. Take with a full glass of water after food"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Prescribed By</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Smith"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Frequency Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. Before breakfast, with meals"
                value={frequencyValue}
                onChange={(e) => setFrequencyValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Personal Notes (optional)</label>
              <textarea
                rows={2}
                placeholder="Side effect observations, storage notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Section 4: Reminders */}
          <div className="p-4 rounded-2xl bg-warm-cream/30 border border-brand-darkPink/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-darkPink" />
                <div>
                  <span className="font-bold text-gray-900 block">In-App Dose Reminders</span>
                  <span className="text-[11px] text-gray-500">
                    Receive reminder notices in your notification center before each dose.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="pt-2 border-t border-brand-darkPink/10 flex items-center justify-between text-xs">
                <span className="text-gray-600">Notify me before scheduled time:</span>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(parseInt(e.target.value, 10))}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white font-medium"
                >
                  <option value={0}>At scheduled time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                </select>
              </div>
            )}
          </div>

          {/* Clinical Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>
              Health Buddy helps you track your medication schedules. It does not prescribe or validate treatments. Consult your healthcare professional for medication guidance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Medication...' : 'Save Medication'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
