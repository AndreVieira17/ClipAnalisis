import { type ReactNode } from 'react';
import { usePointer3D } from '@/hooks/usePointer3D';

interface PopCardProps {
  children: ReactNode;
  className?: string;
  /** stronger lift for hero / CTA targets */
  intensity?: 'soft' | 'strong';
  as?: 'div' | 'button';
  onClick?: () => void;
}

/**
 * Camada A wrapper. Drop any content inside and it gains the universal
 * "pop-out toward pointer" behaviour (mouse + touch), a stretching shadow,
 * and a gold halo that intensifies while held.
 */
export function PopCard({ children, className = '', intensity = 'soft', as = 'div', onClick }: PopCardProps) {
  const strong = intensity === 'strong';
  const p = usePointer3D({ maxTilt: strong ? 14 : 10, lift: strong ? 80 : 50, liftScale: strong ? 1.05 : 1.03 });

  const Tag = as;

  return (
    <div className="scene relative">
      {/* stretching shadow — sold separately from the card so it can lean */}
      <div
        ref={p.shadowRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-3 bottom-0 -z-10 h-full rounded-xzk bg-black/70 blur-2xl"
        style={{ opacity: 0.35, transition: 'transform .4s var(--ease-pop), opacity .4s var(--ease-pop)' }}
      />
      <Tag
        ref={p.ref as never}
        onClick={onClick}
        onPointerMove={p.onMove}
        onPointerDown={p.onPointerDown}
        onPointerUp={p.onPointerUp}
        onPointerLeave={p.onPointerLeave}
        className={`pop3d group relative block w-full text-left ${className}`}
      >
        {children}
      </Tag>
    </div>
  );
}
