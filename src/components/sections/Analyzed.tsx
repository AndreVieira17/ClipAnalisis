import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { staggerParent, staggerChild } from '@/components/ui/motion-presets';
import { PopCard } from '@/components/ui/PopCard';
import { Stat } from '@/components/ui/Stat';
import { ANALYZED } from '@/content';

export function Analyzed() {
  return (
    <section id="analise" className="relative border-y border-border bg-bg-elev/40">
      <div className="mx-auto max-w-[var(--maxw)] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <span className="chip rounded-full px-3 py-1">O QUE É ANALISADO</span>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)]">
            Cada frame passa pelo <span className="gold-foil">raio-X</span>.
          </h2>
        </Reveal>

        {/* métricas em count-up */}
        <div className="mt-12 grid grid-cols-2 gap-8 border-y border-border py-8 sm:grid-cols-4">
          <Stat value={312} prefix="+" suffix="%" label="retenção média" />
          <Stat value={9} suffix=" pontos" label="checados por clip" />
          <Stat value={2} suffix=" min" label="pro raio-X sair" />
          <Stat value={1.2} suffix="M" decimals={1} label="maior virada" />
        </div>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-8%' }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ANALYZED.map((a) => (
            <motion.div key={a.tag} variants={staggerChild}>
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
