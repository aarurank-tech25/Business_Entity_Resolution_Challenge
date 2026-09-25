import React from 'react';
import { Database, ArrowRight, FolderSearch } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No Data Available',
  description = 'No records have been loaded yet.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = ArrowRight,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-200">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {secondaryActionLabel && (
            <Button variant="outline" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button variant="primary" size="md" icon={ActionIcon} iconPosition="right" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
