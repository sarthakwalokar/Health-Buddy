import React, { useState } from 'react';
import { CreateParameterRequest } from '../../types/report';
import { Button } from '../ui/Button';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

interface AddParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateParameterRequest) => Promise<void>;
}

export const AddParameterModal: React.FC<AddParameterModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [parameterName, setParameterName] = useState('');
  const [parameterCode, setParameterCode] = useState('');
  const [valueText, setValueText] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
      await onAdd({
        parameterName: parameterName.trim(),
        parameterCode: parameterCode.trim() || undefined,
        valueText: valueText.trim(),
        valueNumeric: isNaN(numVal) ? undefined : numVal,
        unit: unit.trim() || undefined,
        referenceRange: referenceRange.trim() || undefined,
        source: 'MANUAL',
      });
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to add parameter.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setParameterName('');
    setParameterCode('');
    setValueText('');
    setUnit('');
    setReferenceRange('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-2xl border border-softBorder shadow-elevated w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-softBorder flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-pink-50/30">
          <div>
            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" />
              Add Health Parameter
            </h2>
            <p className="text-xs text-muted mt-0.5">Manually record an extracted or reported metric</p>
          </div>
          <button
            onClick={handleClose}
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

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
                Parameter Name
              </label>
              <input
                type="text"
                value={parameterName}
                onChange={(e) => setParameterName(e.target.value)}
                placeholder="e.g., Vitamin D (25-OH)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
                Code (Opt)
              </label>
              <input
                type="text"
                value={parameterCode}
                onChange={(e) => setParameterCode(e.target.value)}
                placeholder="VIT_D"
                className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
                Value
              </label>
              <input
                type="text"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                placeholder="e.g. 42.5"
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
                placeholder="e.g. ng/mL"
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
              placeholder="e.g. 30 - 100 ng/mL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-softBorder">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add Parameter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
