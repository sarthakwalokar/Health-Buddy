import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { MeasurementContext, UpdateVitalRequest, VitalResponse } from '../../types/vital';

interface EditVitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vital: VitalResponse | null;
  onSubmit: (id: string, data: UpdateVitalRequest) => Promise<unknown>;
}

export const EditVitalModal: React.FC<EditVitalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  vital,
  onSubmit,
}) => {
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [valueNumeric, setValueNumeric] = useState<string>('');
  const [context, setContext] = useState<MeasurementContext | ''>('');
  const [measurementTime, setMeasurementTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vital) {
      if (vital.measurementType === 'BLOOD_PRESSURE') {
        setSystolic(vital.systolic != null ? vital.systolic.toString() : vital.valueNumeric.toString());
        setDiastolic(vital.diastolic != null ? vital.diastolic.toString() : (vital.secondaryValueNumeric?.toString() || ''));
      } else {
        setValueNumeric(vital.valueNumeric.toString());
      }
      setContext(vital.measurementContext || '');
      setMeasurementTime(
        vital.measurementTime
          ? new Date(vital.measurementTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      );
      setNotes(vital.notes || '');
      setError(null);
    }
  }, [vital]);

  if (!isOpen || !vital) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: UpdateVitalRequest = {
      measurementTime: new Date(measurementTime).toISOString(),
      notes: notes.trim() || undefined,
      measurementContext: context ? (context as MeasurementContext) : undefined,
    };

    if (vital.measurementType === 'BLOOD_PRESSURE') {
      const sys = parseFloat(systolic);
      const dia = parseFloat(diastolic);
      if (isNaN(sys) || isNaN(dia)) {
        setError('Please enter valid numeric values for both Systolic and Diastolic.');
        return;
      }
      payload.systolic = sys;
      payload.diastolic = dia;
    } else {
      const val = parseFloat(valueNumeric);
      if (isNaN(val)) {
        setError('Please enter a valid numeric value.');
        return;
      }
      payload.valueNumeric = val;
    }

    try {
      setLoading(true);
      await onSubmit(vital.id, payload);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to update measurement';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-vital-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-warm-cream/30">
          <div>
            <h2 id="edit-vital-title" className="text-lg font-bold text-gray-900">
              Edit Measurement
            </h2>
            <p className="text-xs text-gray-500">
              {vital.measurementType.replace('_', ' ')} • {vital.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {vital.measurementType === 'BLOOD_PRESSURE' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Systolic (mmHg)
                </label>
                <input
                  type="number"
                  step="1"
                  min="40"
                  max="300"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  step="1"
                  min="30"
                  max="200"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Measurement Value ({vital.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={valueNumeric}
                onChange={(e) => setValueNumeric(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={measurementTime}
              onChange={(e) => setMeasurementTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Measurement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
