import { useCountUp } from '@/hooks/useCountUp';

interface StatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

/** Mono gold metric with count-up on view. */
export function Stat({ value, suffix = '', prefix = '', label, decimals = 0 }: StatProps) {
  const { ref, value: v } = useCountUp(value);
  return (
    <div className="flex flex-col gap-1">
      <span
        ref={ref}
        className="num-glow gold-foil font-mono text-4xl font-bold tabular-nums sm:text-5xl"
      >
        {prefix}
        {v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {suffix}
      </span>
      <span className="text-xs uppercase tracking-[0.2em] text-muted">{label}</span>
    </div>
  );
}
