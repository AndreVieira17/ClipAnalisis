import { BrandMark } from '@/components/ui/BrandMark';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-elev/60">
      <div className="mx-auto flex max-w-[var(--maxw)] flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xs">
          <BrandMark size={40} withWordmark />
          <p className="mt-4 text-sm text-muted">
            Raio-X de viralização pra clipador. Manda o vídeo + o print, descobre o que mata teu clip.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-muted">
          <a href="#como" className="hover:text-gold-hi">Como funciona</a>
          <a href="#analise" className="hover:text-gold-hi">O que é analisado</a>
          <a href="#planos" className="hover:text-gold-hi">Planos</a>
          <a href="#faq" className="hover:text-gold-hi">FAQ</a>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[var(--maxw)] flex-col gap-2 px-5 py-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted/70 sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} ClipAnalisis — Todos os direitos reservados</span>
          <span>Feito pra estourar · BR</span>
        </div>
      </div>
    </footer>
  );
}
