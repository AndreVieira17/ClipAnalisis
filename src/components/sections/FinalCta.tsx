import { Reveal } from '@/components/ui/Reveal';
import { Foil } from '@/components/ui/Foil';
import { PopCard } from '@/components/ui/PopCard';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';

export function FinalCta() {
  const { open } = useAnalyzer();
  return (
    <section className="scanlines relative overflow-hidden px-5 py-28 sm:px-8 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.28), transparent 65%)' }}
      />
      <Reveal className="mx-auto max-w-4xl text-center">
        <h2 className="text-[clamp(2.6rem,10vw,7rem)] leading-[0.9]">
          PARA DE <Foil sheen className="num-glow">CHUTAR</Foil>.
          <br />
          COMEÇA A <Foil sheen className="num-glow">ESTOURAR</Foil>.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-muted">
          Manda o vídeo + o print agora. O primeiro raio-X é de graça.
        </p>
        <div className="mt-10 inline-block">
          <PopCard
            intensity="strong"
            as="button"
            onClick={() => open()}
            className="btn-gold gold-glow rounded-xzk px-10 py-5 text-lg"
          >
            ANALISAR MEU CLIP GRÁTIS
          </PopCard>
        </div>
      </Reveal>
    </section>
  );
}
