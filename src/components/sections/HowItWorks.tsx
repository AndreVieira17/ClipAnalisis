import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { staggerParent, staggerChild, wordRevealParent, wordRevealChild } from '@/components/ui/motion-presets';
import { PopCard } from '@/components/ui/PopCard';
import { useI18n } from '@/lib/i18n';

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <section id="como" className="relative mx-auto max-w-[var(--maxw)] px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <span className="chip rounded-full px-3 py-1">{t.howItWorks.chip}</span>
      </Reveal>
      <motion.h2
        className="mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)]"
        variants={wordRevealParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {t.howItWorks.title.split(' ').map((word, i) => (
          <motion.span key={i} variants={wordRevealChild} className="inline-block mr-[0.25em]">
            {word}
          </motion.span>
        ))}
        <motion.span variants={wordRevealChild} className="inline-block text-muted">
          {t.howItWorks.titleHighlight}.
        </motion.span>
      </motion.h2>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
      >
        {t.howItWorks.steps.map((s) => (
          <motion.div key={s.step} variants={staggerChild}>
            <PopCard className="h-full rounded-xzk border border-border bg-surface/60 p-7 transition-colors hover:border-gold/40">
              <span className="num-glow gold-foil font-mono text-5xl font-bold">{s.step}</span>
              <h3 className="mt-5 text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
            </PopCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
