import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { staggerParent, staggerChild } from '@/components/ui/motion-presets';
import { PopCard } from '@/components/ui/PopCard';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';
import { PLANS, type Plan } from '@/content';

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="mt-0.5 shrink-0">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const { open } = useAnalyzer();
  const pro = plan.highlight === 'pro';
  const elite = plan.highlight === 'elite';

  return (
    <PopCard
      intensity={pro ? 'strong' : 'soft'}
      className={[
        'flex h-full flex-col rounded-xzk-lg p-7',
        elite
          ? 'border border-gold/40 bg-gradient-to-b from-[#15130c] to-bg shadow-gold-strong'
          : pro
            ? 'border border-gold/50 bg-surface shadow-gold-glow'
            : 'border border-border bg-surface/50',
      ].join(' ')}
    >
      {pro && (
        <span className="absolute -top-3 left-7 btn-gold rounded-full px-3 py-1 text-[0.65rem]">
          MAIS ESCOLHIDO
        </span>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className={`text-3xl ${elite || pro ? 'gold-foil' : 'text-text'}`}>{plan.name}</h3>
      </div>
      <p className="mt-2 min-h-[2.5rem] text-sm text-muted">{plan.tagline}</p>

      <div className="mt-5 flex items-end gap-1">
        <span className="num-glow gold-foil font-mono text-4xl font-bold">{plan.price}</span>
        <span className="pb-1 font-mono text-xs text-muted">{plan.cadence}</span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-text/90">
            <Check />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => open(plan.id)}
        className={[
          'mt-7 block w-full rounded-xzk px-5 py-3 text-center text-sm transition-transform',
          pro || elite ? 'btn-gold' : 'btn-ghost font-semibold',
        ].join(' ')}
      >
        {plan.cta}
      </button>
    </PopCard>
  );
}

export function Plans() {
  return (
    <section id="planos" className="relative mx-auto max-w-[var(--maxw)] px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="text-center">
        <span className="chip rounded-full px-3 py-1">PLANOS</span>
        <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)]">
          Escolhe o teu <span className="gold-foil">nível</span> de clipador.
        </h2>
      </Reveal>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-8%' }}
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {PLANS.map((p) => (
          <motion.div key={p.name} variants={staggerChild} className="relative">
            <PlanCard plan={p} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
