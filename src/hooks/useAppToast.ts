import { createContext, useContext } from 'react';
import type { ToastVariant } from '@/types';

export interface AppToastCtx {
  toast: (msg: string, variant?: ToastVariant) => void;
}

export const AppToastContext = createContext<AppToastCtx | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAppToast(): AppToastCtx {
  const ctx = useContext(AppToastContext);
  if (!ctx) throw new Error('useAppToast must be used inside AppLayout');
  return ctx;
}
