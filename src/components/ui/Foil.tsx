import { type ElementType, type ReactNode } from 'react';

interface FoilProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** animated sheen band sweeping across the metal */
  sheen?: boolean;
}

/** Gold-foil text: metal gradient clipped to glyphs, optional slow sheen sweep. */
export function Foil({ children, className = '', as: Tag = 'span', sheen = false }: FoilProps) {
  return (
    <Tag className={`relative inline-block ${className}`}>
      <span className="gold-foil">{children}</span>
      {sheen && (
        <span aria-hidden className="gold-foil-sheen absolute inset-0 animate-sheen">
          {children}
        </span>
      )}
    </Tag>
  );
}
