import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PlanTier } from '@/lib/analysis-types';

interface AnalyzerCtx {
  isOpen: boolean;
  intendedPlan: PlanTier | null;
  open: (plan?: PlanTier) => void;
  close: () => void;
}

const Ctx = createContext<AnalyzerCtx | null>(null);

export function AnalyzerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [intendedPlan, setIntendedPlan] = useState<PlanTier | null>(null);

  const open = useCallback((plan?: PlanTier) => {
    setIntendedPlan(plan ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, intendedPlan, open, close }), [isOpen, intendedPlan, open, close]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalyzer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAnalyzer must be used within AnalyzerProvider');
  return ctx;
}
