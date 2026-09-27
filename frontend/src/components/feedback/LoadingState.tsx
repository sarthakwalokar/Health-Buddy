import React from 'react';
import { Spinner } from '../ui/Spinner';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Health Buddy...',
  subMessage = 'Connecting to secure healthcare gateway',
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-xl border border-softBorder shadow-subtle my-6">
      <Spinner size="lg" className="text-primary mb-4" />
      <h3 className="text-lg font-semibold text-charcoal">{message}</h3>
      {subMessage && <p className="text-sm text-muted mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};
