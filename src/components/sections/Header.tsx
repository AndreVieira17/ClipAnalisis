import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';
import { KILLERS } from '@/content';

export function Header() {
  const { open } = useAnalyzer();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* ticker dos "killers" */}
      <div className="overflow-hidden border-b border-border bg-bg/80 backdrop-blur">
        <div className="flex w-max animate-ticker gap-8 py-1.5 will-change-transform">
          {[...KILLERS, ...KILLERS].map((k, i) => (
            <span key={i} className="flex items-center gap-8 font-mono text-[0.65rem] tracking-[0.2em] text-muted">
              <span className="text-danger/80">✕</span> {k}
            </span>
          ))}
        </div>
      </div>

      <nav
        className={`flex items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
          scrolled ? 'bg-bg/85 py-3 backdrop-blur-md' : 'py-5'
        }`}
      >
        <a href="#top" className="flex items-center" aria-label="ClipAnalisis — início">
          <BrandMark size={36} withWordmark />
        </a>

        <div className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
          <a href="#como" className="transition-colors hover:text-gold-hi">Como funciona</a>
          <a href="#analise" className="transition-colors hover:text-gold-hi">O que é analisado</a>
          <a href="#planos" className="transition-colors hover:text-gold-hi">Planos</a>
          <a href="#faq" className="transition-colors hover:text-gold-hi">FAQ</a>
        </div>

        <button
          type="button"
          onClick={() => open()}
          className="btn-gold rounded-xzk px-4 py-2 text-xs sm:px-5 sm:text-sm"
        >
          Analisar clip
        </button>
      </nav>
    </header>
  );
}
