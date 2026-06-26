import { motion } from 'framer-motion';
import { HeroMockup } from './HeroMockup';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';
import { useI18n } from '@/lib/i18n';
import { charRevealParent, charRevealChild, typewriterParent, typewriterChild } from '@/components/ui/motion-presets';

export function Hero() {
  const { open } = useAnalyzer();
  const { t } = useI18n();

  return (
    <section id="top" className="scanlines relative min-h-[100svh] overflow-hidden pt-28 sm:pt-32">
      {/* gold halo backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[680px] w-[680px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.22), transparent 65%)' }}
      />

      <div className="mx-auto grid max-w-[var(--maxw)] grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT — copy */}
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="chip inline-block rounded-full px-3 py-1"
          >
            {t.hero.chip}
          </motion.span>

          <motion.h1
            className="mt-5 text-[clamp(1.8rem,8vw,5.6rem)] leading-[0.92]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}
            variants={charRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Line 1 — plain */}
            <span className="block text-text">
              {[...t.hero.line1].map((ch, i) => (
                <motion.span key={`l1-${i}`} variants={charRevealChild} className={`inline-block${ch === ' ' ? ' w-[0.3em]' : ''}`}>
                  {ch === ' ' ? null : ch}
                </motion.span>
              ))}
            </span>
            {/* Line 2 — gold foil applied per-char (Foil not used to preserve stagger) */}
            <span className="block num-glow">
              {[...t.hero.line2].map((ch, i) => (
                <motion.span key={`l2-${i}`} variants={charRevealChild} className={`inline-block gold-foil${ch === ' ' ? ' w-[0.3em]' : ''}`}>
                  {ch === ' ' ? null : ch}
                </motion.span>
              ))}
            </span>
            {/* Line 3 — plain */}
            <span className="block text-text whitespace-nowrap">
              {[...t.hero.line3].map((ch, i) => (
                <motion.span key={`l3-${i}`} variants={charRevealChild} className={`inline-block${ch === ' ' ? ' w-[0.3em]' : ''}`}>
                  {ch === ' ' ? null : ch}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-base text-muted sm:text-lg"
            variants={typewriterParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {t.hero.subtitle.split(' ').map((word, i) => (
              <motion.span key={i} variants={typewriterChild} className="inline-block mr-[0.28em]">
                {word}
              </motion.span>
            ))}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={() => open()}
              className="btn-gold gold-glow rounded-xzk px-7 py-3.5 text-sm transition-all duration-[400ms] ease-out hover:scale-[1.02] hover:shadow-[0_4px_24px_rgba(212,175,55,0.35)] active:scale-[0.98]"
            >
              {t.hero.cta}
            </button>
            <a href="#como" className="btn-ghost rounded-xzk px-6 py-3.5 text-sm font-semibold">
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>

        {/* RIGHT — animated analysis report mockup */}
        <div className="flex items-center justify-center py-8 lg:py-0">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
