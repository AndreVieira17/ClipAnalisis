import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { Foil } from '@/components/ui/Foil';
import { PopCard } from '@/components/ui/PopCard';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';
import { useI18n } from '@/lib/i18n';
import { wordRevealParent, wordRevealChild } from '@/components/ui/motion-presets';

export function FinalCta() {
  const { open } = useAnalyzer();
  const { t } = useI18n();
  return (
    <section className="scanlines relative overflow-hidden px-5 py-28 sm:px-8 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.28), transparent 65%)' }}
      />
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2
          className="text-[clamp(2.6rem,10vw,7rem)] leading-[0.9]"
          variants={wordRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span variants={wordRevealChild} className="block">
            {t.finalCta.line1a} <Foil sheen className="num-glow">{t.finalCta.line1b}</Foil>.
          </motion.span>
          <motion.span variants={wordRevealChild} className="block">
            {t.finalCta.line2a} <Foil sheen className="num-glow">{t.finalCta.line2b}</Foil>.
          </motion.span>
        </motion.h2>
        <Reveal>
        <p className="mx-auto mt-6 max-w-md text-muted">
          {t.finalCta.subtitle}
        </p>
        <div className="mt-10 inline-block">
          <PopCard
            intensity="strong"
            as="button"
            onClick={() => open()}
            className="btn-gold gold-glow rounded-xzk px-10 py-5 text-lg transition-all duration-[400ms] ease-out hover:scale-[1.02] hover:shadow-[0_4px_24px_rgba(212,175,55,0.35)] active:scale-[0.98]"
          >
            {t.finalCta.cta}
          </PopCard>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
