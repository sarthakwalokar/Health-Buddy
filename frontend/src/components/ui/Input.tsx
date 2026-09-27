import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-charcoal tracking-wide uppercase">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted/60 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-danger focus:border-danger focus:ring-danger text-danger'
                : 'border-softBorder hover:border-muted/50',
              props.disabled && 'bg-charcoal-50 opacity-60 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
