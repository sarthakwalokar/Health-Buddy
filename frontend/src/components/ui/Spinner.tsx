import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} />
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
};
