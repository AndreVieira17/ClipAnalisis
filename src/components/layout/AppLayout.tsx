import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Library,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Toaster } from '@/components/ui/Toaster';
import { AppToastContext } from '@/hooks/useAppToast';
import { TopBar } from './TopBar';

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/upload',    icon: Upload,           label: 'Upload' },
  { to: '/app/historico', icon: History,          label: 'Histórico' },
  { to: '/app/library',   icon: Library,          label: 'Library' },
  { to: '/app/settings',  icon: Settings,         label: 'Definições' },
] as const;

const PLAN_LIMITS: Record<string, number | null> = {
  free: 1, starter: 5, pro: null, elite: null,
};
const PLAN_LABELS: Record<string, string> = {
  free: 'FREE', starter: 'STARTER', pro: 'PRO', elite: 'ELITE',
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { session, plan } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  async function handleLogout() {
    await supabase.auth.signOut();
    addToast('Sessão terminada.', 'info');
    navigate('/auth');
  }

  const email = session?.user?.email ?? '';
  const initials = email.slice(0, 2).toUpperCase();
  const planLimit = PLAN_LIMITS[plan];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-40 flex flex-col bg-app-bg-secondary border-r border-app-border-subtle transition-all duration-300',
        collapsed ? 'w-16' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-app-border-subtle px-4 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-[var(--app-radius-sm)] bg-app-accent flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-grotesk font-bold text-app-text-primary text-sm tracking-tight truncate">
            ClipAnalisis
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[var(--app-radius-md)] px-3 py-2.5 text-sm font-inter font-medium transition-colors',
                isActive
                  ? 'bg-app-accent text-white'
                  : 'text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-hover',
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Usage indicator */}
      {!collapsed && planLimit !== null && (
        <div className="mx-2 mb-2 p-3 rounded-[var(--app-radius-md)] bg-app-bg-card border border-app-border-subtle">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[0.6rem] tracking-widest text-app-text-muted">
              PLANO {PLAN_LABELS[plan]}
            </span>
          </div>
          <div className="text-xs font-inter text-app-text-secondary">
            Limite: {planLimit} {planLimit === 1 ? 'análise' : 'análises/dia'}
          </div>
        </div>
      )}

      {/* User + logout */}
      <div className="px-2 pb-4 pt-2 border-t border-app-border-subtle space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-[var(--app-radius-md)] bg-app-bg-card">
          <div className="w-7 h-7 rounded-full bg-app-accent/20 flex items-center justify-center shrink-0">
            <span className="font-mono text-[0.65rem] text-app-accent">{initials}</span>
          </div>
          {!collapsed && (
            <span className="font-inter text-xs text-app-text-secondary truncate flex-1">{email}</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-[var(--app-radius-md)] px-3 py-2.5 text-sm font-inter font-medium text-app-text-muted hover:text-app-error hover:bg-app-error/10 transition-colors"
          aria-label="Terminar sessão"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-app-bg-card border border-app-border-default flex items-center justify-center text-app-text-muted hover:text-app-text-primary hover:border-app-border-strong transition-colors z-10"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-app-bg-secondary border-t border-app-border-subtle flex md:hidden">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-inter font-medium transition-colors',
              isActive ? 'text-app-accent' : 'text-app-text-muted',
            )
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// ── AppLayout (exported) ──────────────────────────────────────────────────────
export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <AppToastContext.Provider value={{ toast: addToast }}>
      <div className="app-root min-h-screen bg-app-bg-primary font-inter text-app-text-primary">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        <main
          className={cn(
            'transition-all duration-300 min-h-screen pb-20 md:pb-0',
            collapsed ? 'md:ml-16' : 'md:ml-[220px]',
          )}
        >
          <TopBar />
          {children}
        </main>

        <BottomNav />
        <Toaster toasts={toasts} onRemove={removeToast} />
      </div>
    </AppToastContext.Provider>
  );
}
