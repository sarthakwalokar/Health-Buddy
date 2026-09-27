import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no items or activities to display in this section.',
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-xl border border-dashed border-softBorder my-6">
      <div className="w-12 h-12 rounded-full bg-charcoal-50 flex items-center justify-center text-muted mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-charcoal">{title}</h4>
      <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="secondary" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
