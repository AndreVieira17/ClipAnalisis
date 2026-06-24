import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-app-bg-hover rounded-[var(--app-radius-sm)] animate-pulse',
        className,
      )}
      aria-hidden
    />
  );
}

export function AnalysisCardSkeleton() {
  return (
    <div className="bg-app-bg-card border border-app-border-subtle rounded-[var(--app-radius-lg)] p-4 space-y-3">
      <Skeleton className="h-32 w-full rounded-[var(--app-radius-md)]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
