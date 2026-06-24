import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast } from '@/types';

interface ToasterProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const COLORS = {
  success: 'text-app-success border-app-success/30',
  error:   'text-app-error   border-app-error/30',
  warning: 'text-app-warning border-app-warning/30',
  info:    'text-app-info    border-app-info/30',
};

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return (
    <div
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 bg-app-bg-card border rounded-[var(--app-radius-md)] px-4 py-3 shadow-[var(--app-shadow-card)] min-w-[260px] max-w-sm',
                COLORS[t.variant],
              )}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="font-inter text-sm text-app-text-primary flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => onRemove(t.id)}
                className="text-app-text-muted hover:text-app-text-primary transition-colors shrink-0"
                aria-label="Fechar notificação"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
