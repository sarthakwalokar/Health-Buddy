import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Scale,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CreateVitalRequest, MeasurementContext, MeasurementType } from '../../types/vital';

interface RecordVitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: CreateVitalRequest) => Promise<unknown>;
  initialType?: MeasurementType;
}

export const RecordVitalModal: React.FC<RecordVitalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  initialType = 'BLOOD_PRESSURE',
}) => {
  const [measurementType, setMeasurementType] = useState<MeasurementType>(initialType);
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [valueNumeric, setValueNumeric] = useState<string>('');
  const [context, setContext] = useState<MeasurementContext | ''>('');
  const [measurementTime, setMeasurementTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreateVitalRequest = {
      measurementType,
      measurementTime: new Date(measurementTime).toISOString(),
      notes: notes.trim() || undefined,
      measurementContext: context ? (context as MeasurementContext) : undefined,
    };

    if (measurementType === 'BLOOD_PRESSURE') {
      const sys = parseFloat(systolic);
      const dia = parseFloat(diastolic);
      if (isNaN(sys) || isNaN(dia)) {
        setError('Please enter valid numeric values for both Systolic and Diastolic blood pressure.');
        return;
      }
      payload.systolic = sys;
      payload.diastolic = dia;
    } else {
      const val = parseFloat(valueNumeric);
      if (isNaN(val)) {
        setError('Please enter a valid numeric value for the measurement.');
        return;
      }
      payload.valueNumeric = val;
    }

    try {
      setLoading(true);
      await onSubmit(payload);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to record measurement';
      setError(msg);
    }
  };

  const vitalTypes: { type: MeasurementType; label: string; icon: any; unit: string }[] = [
    { type: 'BLOOD_PRESSURE', label: 'Blood Pressure', icon: Activity, unit: 'mmHg' },
    { type: 'HEART_RATE', label: 'Heart Rate', icon: Heart, unit: 'bpm' },
    { type: 'BLOOD_GLUCOSE', label: 'Blood Glucose', icon: Droplet, unit: 'mg/dL' },
    { type: 'SPO2', label: 'SpO2 Oxygen', icon: Wind, unit: '%' },
    { type: 'TEMPERATURE', label: 'Temperature', icon: Thermometer, unit: '°C' },
    { type: 'WEIGHT', label: 'Weight', icon: Scale, unit: 'kg' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-vital-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-warm-cream/30">
          <div>
            <h2 id="record-vital-title" className="text-xl font-bold text-gray-900">
              Record Health Measurement
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep your health logs organized and monitor clinical trends.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Measurement Type Selector Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Select Measurement Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {vitalTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = measurementType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setMeasurementType(item.type);
                      setError(null);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{item.unit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Values Form */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
            {measurementType === 'BLOOD_PRESSURE' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Systolic (mmHg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="40"
                    max="300"
                    placeholder="e.g. 120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                  <span className="text-[10px] text-gray-400">Upper number</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Diastolic (mmHg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="30"
                    max="200"
                    placeholder="e.g. 80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                  <span className="text-[10px] text-gray-400">Lower number</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {measurementType === 'HEART_RATE' && 'Heart Rate (bpm)'}
                  {measurementType === 'BLOOD_GLUCOSE' && 'Blood Glucose (mg/dL)'}
                  {measurementType === 'TEMPERATURE' && 'Body Temperature (°C)'}
                  {measurementType === 'SPO2' && 'Oxygen Saturation SpO2 (%)'}
                  {measurementType === 'WEIGHT' && 'Weight (kg)'}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={measurementType === 'TEMPERATURE' || measurementType === 'WEIGHT' || measurementType === 'BLOOD_GLUCOSE' ? '0.1' : '1'}
                    placeholder={
                      measurementType === 'HEART_RATE'
                        ? 'e.g. 72'
                        : measurementType === 'BLOOD_GLUCOSE'
                        ? 'e.g. 95'
                        : measurementType === 'TEMPERATURE'
                        ? 'e.g. 36.8'
                        : measurementType === 'SPO2'
                        ? 'e.g. 98'
                        : 'e.g. 70.0'
                    }
                    value={valueNumeric}
                    onChange={(e) => setValueNumeric(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
                {measurementType === 'WEIGHT' && (
                  <p className="text-[11px] text-brand-darkPink mt-1.5 flex items-center gap-1">
                    <span>💡</span> Your BMI will be calculated automatically using your profile height.
                  </p>
                )}
              </div>
            )}

            {/* Context Dropdown (for Glucose & Blood Pressure) */}
            {measurementType === 'BLOOD_GLUCOSE' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Measurement Context
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value as MeasurementContext)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select context...</option>
                  <option value="FASTING">Fasting (Before breakfast)</option>
                  <option value="POST_MEAL">Post-Meal (1-2 hours after eating)</option>
                  <option value="RANDOM">Random / Spot check</option>
                  <option value="BEFORE_EXERCISE">Before Exercise</option>
                  <option value="AFTER_EXERCISE">After Exercise</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            )}

            {measurementType === 'BLOOD_PRESSURE' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Measurement Context
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value as MeasurementContext)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="RESTING">Resting (Seated, calm for 5 min)</option>
                  <option value="AFTER_EXERCISE">After Exercise</option>
                  <option value="RANDOM">Random / Active</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700">
                Date & Time of Reading <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setMeasurementTime(new Date().toISOString().slice(0, 16))}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Clock className="w-3 h-3" /> Set to Now
              </button>
            </div>
            <input
              type="datetime-local"
              value={measurementTime}
              onChange={(e) => setMeasurementTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Clinical Notes / Symptoms (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Felt slightly tired, recorded after morning coffee..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-warm-cream/40 rounded-xl border border-warm-cream text-[11px] text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-800">Clinical Safety Notice:</span> Recorded measurements are maintained for personal tracking and clinical consultation. Health Buddy provides informational trend analysis and does not replace diagnostic evaluations by qualified healthcare professionals.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Measurement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
