import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'pink' | 'success' | 'warning' | 'amber' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-full tracking-wide transition-colors';

  const variants = {
    primary: 'bg-orange-50 text-orange-800 border border-orange-200',
    pink: 'bg-pink-50 text-pink-800 border border-pink-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-orange-50 text-orange-900 border border-orange-300',
    amber: 'bg-amber-50 text-amber-900 border border-amber-300',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    neutral: 'bg-stone-100 text-stone-800 border border-stone-200',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
