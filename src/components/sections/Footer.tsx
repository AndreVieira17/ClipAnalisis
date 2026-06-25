import { BrandMark } from '@/components/ui/BrandMark';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-bg-elev/60">
      <div className="mx-auto flex max-w-[var(--maxw)] flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xs">
          <BrandMark size={40} withWordmark />
          <p className="mt-4 text-sm text-muted">{t.footer.description}</p>
        </div>

        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-muted">
          <a href="#como" className="hover:text-gold-hi">{t.footer.links.howItWorks}</a>
          <a href="#analise" className="hover:text-gold-hi">{t.footer.links.whatAnalyzed}</a>
          <a href="#planos" className="hover:text-gold-hi">{t.footer.links.plans}</a>
          <a href="#faq" className="hover:text-gold-hi">{t.footer.links.faq}</a>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[var(--maxw)] flex-col gap-2 px-5 py-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted/70 sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} ClipAnalisis — {t.footer.copyright}</span>
          <span>{t.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
