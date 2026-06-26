import { motion } from 'framer-motion';

const BARS = [
  { label: 'Hook',     score: 92, color: '#D4AF37' },
  { label: 'Pacing',   score: 78, color: '#D4AF37' },
  { label: 'Áudio',    score: 85, color: '#D4AF37' },
  { label: 'Retenção', score: 74, color: '#B8932E' },
] as const;

const SCORE = 87;
const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

function CircularScore() {
  const offset = CIRCUMFERENCE * (1 - SCORE / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden>
          {/* track */}
          <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="8" />
          {/* progress */}
          <motion.circle
            cx="65" cy="65" r="52"
            fill="none"
            stroke="url(#gold-grad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
            transform="rotate(-90 65 65)"
          />
          <defs>
            <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F6E08A" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span
            className="font-mono text-3xl font-bold leading-none"
            style={{ color: '#F6E08A' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {SCORE}
          </motion.span>
          <span className="font-mono text-xs text-muted/60">/100</span>
        </div>
      </div>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted/60">
        VIRAL READINESS
      </span>
    </div>
  );
}

function ScoreBar({ label, score, color, delay }: { label: string; score: number; color: string; delay: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-xs">
        <span className="text-muted/80">{label}</span>
        <span style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}

export function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-[360px]"
    >
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212,175,55,0.3), 0 20px 60px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[20px] blur-[60px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)' }}
      />

      <div
        className="rounded-[18px] border p-6 space-y-5"
        style={{
          background: 'linear-gradient(135deg, #141410 0%, #0f0f0a 100%)',
          borderColor: 'rgba(212,175,55,0.25)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(212,175,55,0.06)',
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted/60">
              ANÁLISE COMPLETA
            </p>
            <p className="mt-0.5 font-display text-sm text-text/80">TikTok · humor</p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em]"
            style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
          >
            DONE
          </span>
        </div>

        {/* circular score */}
        <CircularScore />

        {/* score bars */}
        <div className="space-y-3 pt-1">
          {BARS.map((b, i) => (
            <ScoreBar key={b.label} {...b} delay={0.5 + i * 0.12} />
          ))}
        </div>

        {/* verdict strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="rounded-[10px] p-3 text-center"
          style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em]" style={{ color: '#D4AF37' }}>
            GARGALO PRINCIPAL
          </p>
          <p className="mt-1 text-xs text-muted/80">
            Curva de retenção cai 38% ao segundo 4 — gancho fraco.
          </p>
        </motion.div>
      </div>
    </motion.div>
    </motion.div>
  );
}
