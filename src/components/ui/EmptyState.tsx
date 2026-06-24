import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      <div className="w-12 h-12 rounded-[var(--app-radius-lg)] bg-app-accent-subtle flex items-center justify-center text-app-accent mb-4">
        {icon}
      </div>
      <h3 className="font-grotesk font-semibold text-app-text-primary text-base">{title}</h3>
      <p className="font-inter text-app-text-muted text-sm mt-1.5 max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
