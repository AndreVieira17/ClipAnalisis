import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-inter font-medium rounded-[var(--app-radius-md)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg-primary disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-app-accent text-white hover:bg-app-accent-hover active:scale-[0.98] shadow-[0_0_0_1px_rgba(124,58,237,0.4)]',
    secondary:
      'bg-app-bg-card text-app-text-primary border border-app-border-default hover:bg-app-bg-hover hover:border-app-border-strong active:scale-[0.98]',
    ghost:
      'bg-transparent text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg-hover active:scale-[0.98]',
    danger:
      'bg-app-error/10 text-app-error border border-app-error/30 hover:bg-app-error/20 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
