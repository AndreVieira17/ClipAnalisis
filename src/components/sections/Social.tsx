import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { staggerParent, staggerChild } from '@/components/ui/motion-presets';
import { PopCard } from '@/components/ui/PopCard';
import { useI18n } from '@/lib/i18n';

export function Social() {
  const { t } = useI18n();
  return (
    <section className="relative border-y border-border bg-bg-elev/40">
      <div className="mx-auto max-w-[var(--maxw)] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <span className="chip rounded-full px-3 py-1">{t.social.chip}</span>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)]">
            {t.social.title.split('1.2M').length > 1 ? (
              <>
                {t.social.title.split('1.2M')[0]}
                <span className="gold-foil">1.2M</span>
                {t.social.title.split('1.2M')[1]}
              </>
            ) : t.social.title}
          </h2>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-8%' }}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {t.social.testimonials.map((s) => (
            <motion.div
              key={s.author}
              variants={staggerChild}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(212,175,55,0.15)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <PopCard className="flex h-full flex-col rounded-xzk border border-border bg-surface/60 p-7">
                <p className="flex-1 text-lg leading-snug text-text">{'"'}{s.quote}{'"'}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 font-mono text-xs text-gold">
                    {s.author.replace('@', '').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold text-text">{s.author}</span>
                    <span className="text-muted">{s.role}</span>
                  </span>
                </div>
              </PopCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
