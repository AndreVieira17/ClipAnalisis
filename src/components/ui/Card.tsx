import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'solid' | 'glass';
  className?: string;
  onClick?: () => void;
}

export function Card({ children, variant = 'solid', className, onClick }: CardProps) {
  const base = 'rounded-[var(--app-radius-lg)] transition-colors duration-150';
  const variants = {
    solid:
      'bg-app-bg-card border border-app-border-subtle shadow-[var(--app-shadow-card)]',
    glass:
      'bg-app-bg-card/60 backdrop-blur-md border border-app-border-subtle shadow-[var(--app-shadow-card)]',
  };
  const interactive = onClick
    ? 'cursor-pointer hover:bg-app-bg-hover hover:border-app-border-default'
    : '';

  return (
    <div
      className={cn(base, variants[variant], interactive, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
