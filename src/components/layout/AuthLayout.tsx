import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center px-4">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, var(--app-accent), transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-[var(--app-radius-sm)] bg-app-accent flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-grotesk font-bold text-app-text-primary text-base">ClipAnalisis</span>
        </Link>

        {/* Card */}
        <div className="bg-app-bg-card border border-app-border-subtle rounded-[var(--app-radius-xl)] p-8 shadow-[var(--app-shadow-card)]">
          <h1 className="font-grotesk font-bold text-app-text-primary text-xl mb-1">{title}</h1>
          {subtitle && (
            <p className="font-inter text-app-text-muted text-sm mb-6">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
