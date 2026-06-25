import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/ui/BrandMark';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useI18n, FLAGS, LANG_LABELS, type Lang } from '@/lib/i18n';


const PLAN_BADGE: Record<string, string> = {
  free:    'border-white/20 bg-white/5 text-white/50',
  starter: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  pro:     'border-gold/50 bg-gold/10 text-gold',
  elite:   'border-amber-400/60 bg-amber-400/10 text-amber-300',
};

const PLAN_LABEL: Record<string, string> = {
  free: 'FREE', starter: 'STARTER', pro: 'PRO', elite: 'ELITE',
};

/* ── Language selector ───────────────────────────────────────────── */
function LangSelector() {
  const { lang, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/40 px-2.5 py-1.5 text-xs font-mono text-muted transition-colors hover:border-gold/40 hover:text-gold"
      >
        <span>{FLAGS[lang]}</span>
        <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[100] mt-1.5 min-w-[80px] overflow-hidden rounded-xzk border border-border bg-bg shadow-xl">
          {(['pt', 'en', 'es'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLanguage(l); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs font-mono transition-colors hover:bg-surface/60 ${
                l === lang ? 'text-gold' : 'text-muted'
              }`}
            >
              <span>{FLAGS[l]}</span>
              <span>{LANG_LABELS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sign-out confirmation modal ─────────────────────────────────── */
function SignOutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xzk border border-border bg-bg shadow-xl p-7 text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted mb-3">ClipAnalisis</p>
        <h2 className="text-2xl mb-2">{t.signOutModal.title}</h2>
        <p className="text-sm text-muted mb-6">{t.signOutModal.message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="btn-ghost rounded-xzk px-5 py-2.5 text-sm font-semibold"
          >
            {t.signOutModal.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xzk border border-danger/50 bg-danger/10 px-5 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20 transition-colors"
          >
            {t.signOutModal.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── User dropdown ───────────────────────────────────────────────── */
function UserDropdown({
  onClose,
  onSignOutRequest,
}: {
  onClose: () => void;
  onSignOutRequest: () => void;
}) {
  const { session, plan, fullName } = useAuth();
  const { t } = useI18n();
  const email = session?.user?.email ?? '';
  const displayName = fullName || email.split('@')[0] || '';
  const initials = (fullName
    ? fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
    : email.slice(0, 2)
  ).toUpperCase() || 'XZ';

  return (
    <div className="absolute right-0 top-full mt-2 w-[300px] rounded-xzk border border-border bg-bg/98 backdrop-blur-md shadow-2xl z-50 overflow-hidden">
      {/* Avatar + info */}
      <div className="flex items-center gap-4 px-5 py-5 border-b border-border bg-surface/30">
        <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
          <span className="font-mono text-base font-bold text-gold leading-none">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          {displayName && (
            <p className="font-semibold text-sm text-text truncate leading-tight mb-0.5">{displayName}</p>
          )}
          <p className="text-xs text-muted truncate">{email}</p>
        </div>
      </div>

      {/* Plan badge */}
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[0.6rem] font-mono text-muted uppercase tracking-[0.15em] mb-1.5">{t.nav.currentPlan}</p>
        <span className={`inline-block font-mono text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
          {PLAN_LABEL[plan] ?? plan.toUpperCase()}
        </span>
      </div>

      {/* Links */}
      <div className="py-2">
        <Link
          to="/historico"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 text-sm text-muted hover:text-text hover:bg-surface/50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span>{t.nav.myClips}</span>
        </Link>

        <div className="mx-5 my-1 border-t border-border/50" />

        <button
          onClick={onSignOutRequest}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm text-muted hover:text-danger hover:bg-danger/5 transition-colors text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{t.nav.signOut}</span>
        </button>
      </div>
    </div>
  );
}

/* ── Header ──────────────────────────────────────────────────────── */
export function Header() {
  const { open } = useAnalyzer();
  const { session } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  async function handleSignOutConfirm() {
    setSignOutModal(false);
    setDropdownOpen(false);
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* ticker dos "killers" */}
        <div className="overflow-hidden border-b border-border bg-bg/80 backdrop-blur">
          <div className="flex w-max animate-ticker gap-8 py-1.5 will-change-transform">
            {[...t.killers, ...t.killers].map((k, i) => (
              <span key={i} className="flex items-center gap-8 font-mono text-[0.65rem] tracking-[0.2em] text-muted">
                <span className="text-danger/80">✕</span> {k}
              </span>
            ))}
          </div>
        </div>

        <nav
          className={`flex items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
            scrolled ? 'bg-bg/85 py-3 backdrop-blur-md' : 'py-5'
          }`}
        >
          {/* Logo */}
          <a href="#top" className="flex items-center" aria-label="ClipAnalisis — início">
            <BrandMark size={36} withWordmark />
          </a>

          {/* Nav links (desktop) */}
          <div className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
            <a href="#como" className="transition-colors hover:text-gold-hi">{t.nav.howItWorks}</a>
            <a href="#analise" className="transition-colors hover:text-gold-hi">{t.nav.whatAnalyzed}</a>
            <a href="#planos" className="transition-colors hover:text-gold-hi">{t.nav.plans}</a>
            <a href="#faq" className="transition-colors hover:text-gold-hi">{t.nav.faq}</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LangSelector />
            {session ? (
              <>
                <button
                  type="button"
                  onClick={() => open()}
                  className="btn-gold rounded-xzk px-4 py-2 text-xs sm:px-5 sm:text-sm transition-all duration-[400ms] ease-out hover:scale-[1.02] hover:shadow-[0_4px_24px_rgba(212,175,55,0.35)] active:scale-[0.98]"
                >
                  {t.nav.analyzeClip}
                </button>

                {/* User icon → dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-label="Perfil"
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                      dropdownOpen
                        ? 'border-gold/50 bg-surface/80'
                        : 'border-border bg-surface/60 hover:border-gold/40'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <UserDropdown
                      onClose={() => setDropdownOpen(false)}
                      onSignOutRequest={() => { setDropdownOpen(false); setSignOutModal(true); }}
                    />
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => open()}
                className="btn-gold rounded-xzk px-4 py-2 text-xs sm:px-5 sm:text-sm transition-all duration-[400ms] ease-out hover:scale-[1.02] hover:shadow-[0_4px_24px_rgba(212,175,55,0.35)] active:scale-[0.98]"
              >
                {t.nav.analyzeClip}
              </button>
            )}
          </div>
        </nav>
      </header>

      {signOutModal && (
        <SignOutModal
          onCancel={() => setSignOutModal(false)}
          onConfirm={handleSignOutConfirm}
        />
      )}
    </>
  );
}
