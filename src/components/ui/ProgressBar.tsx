import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  className?: string;
  variant?: 'accent' | 'success' | 'warning';
  animated?: boolean;
}

export function ProgressBar({
  value,
  label,
  className,
  variant = 'accent',
  animated = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const trackColors = {
    accent:  'bg-app-accent',
    success: 'bg-app-success',
    warning: 'bg-app-warning',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-inter text-app-text-muted">{label}</span>
          <span className="text-xs font-mono text-app-text-secondary">{clamped}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-app-bg-hover rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            trackColors[variant],
            animated && 'animate-pulse',
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
