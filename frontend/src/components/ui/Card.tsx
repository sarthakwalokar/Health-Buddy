import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warm' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variants = {
    default: 'bg-surface border border-softBorder shadow-subtle hover:shadow-card hover:border-primary-200 transition-all duration-200',
    warm: 'bg-gradient-to-br from-white to-amber-50/30 border border-amber-200/60 shadow-subtle hover:shadow-card transition-all duration-200',
    elevated: 'bg-surface border border-softBorder shadow-elevated',
    glass: 'bg-surface/90 backdrop-blur-md border border-softBorder shadow-card',
  };

  return (
    <div
      className={cn(
        'rounded-2xl',
        paddings[padding],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
