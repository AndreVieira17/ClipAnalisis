import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg uppercase tracking-tight text-text sm:text-xl">{q}</span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/40 text-gold transition-transform duration-300 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <span className="chip rounded-full px-3 py-1">{t.faq.chip}</span>
        <h2 className="mt-4 text-[clamp(2rem,5vw,3.4rem)]">{t.faq.title}</h2>
      </Reveal>
      <Reveal className="mt-8">
        {t.faq.items.map((f) => (
          <Item key={f.q} q={f.q} a={f.a} />
        ))}
      </Reveal>
    </section>
  );
}
