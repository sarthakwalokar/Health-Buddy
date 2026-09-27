import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while communicating with the server. Please try again.',
  onRetry,
}) => {
  return (
    <div className="min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-xl border border-danger/20 shadow-subtle my-6">
      <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center text-danger mb-4">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
      <p className="text-sm text-muted mt-2 max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-6"
          leftIcon={<RotateCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
