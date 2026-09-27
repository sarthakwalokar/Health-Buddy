import React, { useState, useEffect } from 'react';
import { MedicalReportParameter, UpdateParameterRequest } from '../../types/report';
import { Button } from '../ui/Button';
import { X, Edit2, AlertCircle, ShieldCheck } from 'lucide-react';

interface EditParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: MedicalReportParameter | null;
  onSave: (parameterId: string, data: UpdateParameterRequest) => Promise<void>;
}

export const EditParameterModal: React.FC<EditParameterModalProps> = ({
  isOpen,
  onClose,
  parameter,
  onSave,
}) => {
  const [parameterName, setParameterName] = useState('');
  const [valueText, setValueText] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [patientVerified, setPatientVerified] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (parameter) {
      setParameterName(parameter.parameterName || '');
      setValueText(parameter.valueText || '');
      setUnit(parameter.unit || '');
      setReferenceRange(parameter.referenceRange || '');
      setPatientVerified(true);
      setErrorMessage(null);
    }
  }, [parameter]);

  if (!isOpen || !parameter) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameterName.trim()) {
      setErrorMessage('Parameter name is required.');
      return;
    }
    if (!valueText.trim()) {
      setErrorMessage('Value is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const numVal = parseFloat(valueText);
      await onSave(parameter.id, {
        parameterName: parameterName.trim(),
        valueText: valueText.trim(),
        valueNumeric: isNaN(numVal) ? undefined : numVal,
        unit: unit.trim() || undefined,
        referenceRange: referenceRange.trim() || undefined,
        patientVerified,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to update parameter.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-2xl border border-softBorder shadow-elevated w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-softBorder flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-pink-50/30">
          <div>
            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-primary" />
              Correct Clinical Parameter
            </h2>
            <p className="text-xs text-muted mt-0.5">Original extraction will be preserved for auditability</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-brandRed/20 rounded-xl text-xs text-brandRed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {parameter.originalValueText && (
            <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl text-xs text-charcoal">
              <span className="font-semibold text-primary">Original Extracted Value:</span>{' '}
              <span className="font-mono">{parameter.originalValueText}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
              Parameter Name
            </label>
            <input
              type="text"
              value={parameterName}
              onChange={(e) => setParameterName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
                Corrected Value
              </label>
              <input
                type="text"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                placeholder="e.g. 14.2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. g/dL, mg/dL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
              Reference Range
            </label>
            <input
              type="text"
              value={referenceRange}
              onChange={(e) => setReferenceRange(e.target.value)}
              placeholder="e.g. 13.0 - 17.0 g/dL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="patientVerified"
              checked={patientVerified}
              onChange={(e) => setPatientVerified(e.target.checked)}
              className="w-4 h-4 text-primary border-softBorder rounded focus:ring-primary"
            />
            <label htmlFor="patientVerified" className="text-xs font-semibold text-charcoal flex items-center gap-1.5 cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Mark as Patient-Verified
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-softBorder">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Save & Verify
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
