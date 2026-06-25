import { Link } from 'react-router-dom';
import { History, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const PLAN_COLORS: Record<string, string> = {
  free:    'bg-white/10 text-white/70',
  starter: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  pro:     'bg-app-accent/20 text-app-accent border border-app-accent/40',
  elite:   'bg-amber-500/20 text-amber-300 border border-amber-500/40',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'FREE', starter: 'STARTER', pro: 'PRO', elite: 'ELITE',
};

export function TopBar() {
  const { session, plan, fullName } = useAuth();

  const email = session?.user?.email ?? '';
  const displayName = fullName || email.split('@')[0] || 'Utilizador';
  const initials = (fullName
    ? fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : email.slice(0, 2)
  ).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0F0F18] px-6 py-3">
      {/* Left: breadcrumb slot */}
      <div className="flex-1" />

      {/* Right: history button + profile chip */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/app/historico"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-inter font-medium text-white/60 hover:border-white/20 hover:text-white/90 transition-colors"
        >
          <History size={13} className="shrink-0" />
          <span className="hidden sm:inline">Os meus clips</span>
        </Link>

        {/* Profile chip */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
          {/* Avatar with purple fill */}
          <div className="w-7 h-7 rounded-full bg-app-accent flex items-center justify-center shrink-0 ring-2 ring-app-accent/30">
            <span className="text-[0.6rem] font-bold text-white leading-none">{initials}</span>
          </div>

          {/* Name + email (desktop) */}
          <div className="hidden sm:flex flex-col leading-tight min-w-0">
            <span className="font-inter font-semibold text-white/90 text-xs truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="font-inter text-white/35 text-[0.6rem] truncate max-w-[130px]">
              {email}
            </span>
          </div>

          {/* Plan badge */}
          <span
            className={cn(
              'shrink-0 font-mono text-[0.55rem] font-bold tracking-widest px-1.5 py-0.5 rounded-md',
              PLAN_COLORS[plan] ?? PLAN_COLORS.free,
            )}
          >
            {PLAN_LABELS[plan] ?? 'FREE'}
          </span>

          {/* Upgrade CTA (free plan only) */}
          {plan === 'free' && (
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1 rounded-md bg-app-accent px-2 py-0.5 text-[0.6rem] font-bold font-inter text-white hover:bg-app-accent-hover transition-colors"
            >
              <Zap size={9} />
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
