import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ActionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  description?: string;
  disclaimer?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning' | 'amber' | 'emerald' | 'blue' | 'red';
  isLoading?: boolean;
}

export const ActionConfirmationDialog: React.FC<ActionConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  disclaimer = 'This will update this medication record in Health Buddy. It does not alter your actual medical treatment. Follow your healthcare professional’s instructions.',
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const displayMessage = description || message || '';

  const isDanger = confirmVariant === 'danger' || confirmVariant === 'red';
  const isWarning = confirmVariant === 'warning' || confirmVariant === 'amber';
  const isSuccess = confirmVariant === 'emerald';
  const isBlue = confirmVariant === 'blue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className={`p-3 rounded-2xl ${
            isDanger
              ? 'bg-red-50 text-red-600'
              : isWarning
              ? 'bg-amber-50 text-amber-600'
              : isSuccess
              ? 'bg-emerald-50 text-emerald-600'
              : isBlue
              ? 'bg-blue-50 text-blue-600'
              : 'bg-primary/10 text-primary'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {displayMessage && <p className="text-xs text-gray-600 mt-1">{displayMessage}</p>}
          </div>
        </div>

        {disclaimer && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-800 mb-5 leading-relaxed">
            <span className="font-semibold block mb-0.5">Clinical Note:</span>
            {disclaimer}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmVariant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
