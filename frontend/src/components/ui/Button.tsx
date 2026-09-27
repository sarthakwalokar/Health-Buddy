import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pink' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary',
    secondary:
      'bg-primary-50 text-primary-dark hover:bg-primary-100 border border-primary-200 focus:ring-primary',
    pink:
      'bg-brandPink text-white hover:bg-brandPink-dark shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-brandPink',
    outline:
      'border border-softBorder text-charcoal hover:bg-orange-50/50 hover:border-primary-300 focus:ring-primary bg-surface shadow-xs',
    danger:
      'bg-brandRed text-white hover:bg-brandRed-dark shadow-sm hover:shadow-md focus:ring-brandRed',
    ghost:
      'text-charcoal hover:bg-primary-50 hover:text-primary-dark focus:ring-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
