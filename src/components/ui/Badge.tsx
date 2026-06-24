import { cn } from '@/lib/utils';
import type { AnalysisStatus } from '@/types';

interface BadgeProps {
  status: AnalysisStatus;
  className?: string;
}

const CONFIG: Record<AnalysisStatus, { label: string; dot: string; bg: string; text: string }> = {
  done:  { label: 'Analisado', dot: 'bg-app-success', bg: 'bg-app-success/10', text: 'text-app-success' },
  error: { label: 'Erro',      dot: 'bg-app-error',   bg: 'bg-app-error/10',   text: 'text-app-error' },
};

export function Badge({ status, className }: BadgeProps) {
  const c = CONFIG[status] ?? CONFIG.done;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-inter font-medium',
        c.bg,
        c.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}
