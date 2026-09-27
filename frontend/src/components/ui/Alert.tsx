import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  className,
  variant = 'info',
  title,
  onClose,
  ...props
}) => {
  const configs = {
    info: {
      container: 'bg-primary-50 border-primary-200 text-charcoal',
      icon: <Info className="w-5 h-5 text-primary flex-shrink-0" />,
    },
    success: {
      container: 'bg-primary-50 border-primary text-charcoal',
      icon: <CheckCircle2 className="w-5 h-5 text-primary-dark flex-shrink-0" />,
    },
    warning: {
      container: 'bg-warning-light border-warning text-charcoal',
      icon: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
    },
    danger: {
      container: 'bg-danger-light border-danger text-charcoal',
      icon: <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />,
    },
  };

  const config = configs[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex items-start gap-3 transition-all',
        config.container,
        className
      )}
      role="alert"
      {...props}
    >
      {config.icon}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div className="text-charcoal/90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted hover:text-charcoal text-xs font-semibold ml-2"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
