import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { staggerParent, staggerChild, wordRevealParent, wordRevealChild } from '@/components/ui/motion-presets';
import { PopCard } from '@/components/ui/PopCard';
import { Stat } from '@/components/ui/Stat';
import { useI18n } from '@/lib/i18n';

const STAT_VALUES = [
  { value: 312, prefix: '+', suffix: '%', decimals: 0 },
  { value: 20,  prefix: '',  suffix: ' pontos', decimals: 0 },
  { value: 2,   prefix: '',  suffix: ' min', decimals: 0 },
  { value: 1.2, prefix: '',  suffix: 'M', decimals: 1 },
];

export function Analyzed() {
  const { t } = useI18n();
  return (
    <section id="analise" className="relative border-y border-border bg-bg-elev/40">
      <div className="mx-auto max-w-[var(--maxw)] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <span className="chip rounded-full px-3 py-1">{t.analyzed.chip}</span>
        </Reveal>
        <motion.h2
          className="mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)]"
          variants={wordRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {t.analyzed.title.split(' ').map((word, i) => (
            <motion.span key={i} variants={wordRevealChild} className="inline-block mr-[0.25em]">
              {word}
            </motion.span>
          ))}
          <motion.span variants={wordRevealChild} className="inline-block gold-foil">
            {t.analyzed.titleHighlight}.
          </motion.span>
        </motion.h2>

        <div className="mt-12 grid grid-cols-2 gap-8 border-y border-border py-8 sm:grid-cols-4">
          {STAT_VALUES.map((sv, i) => (
            <Stat
              key={i}
              value={sv.value}
              prefix={sv.prefix}
              suffix={sv.suffix}
              decimals={sv.decimals}
              label={t.analyzed.stats[i]?.label ?? ''}
            />
          ))}
        </div>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-8%' }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.analyzed.cards.map((a) => (
            <motion.div
              key={a.tag}
              variants={staggerChild}
              style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease', borderRadius: '12px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(212,175,55,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <PopCard className="h-full rounded-xzk border border-border bg-surface/60 p-6 transition-colors hover:border-gold/40">
                <span className="chip rounded px-2 py-0.5">{a.tag}</span>
                <h3 className="mt-4 text-xl">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
              </PopCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
