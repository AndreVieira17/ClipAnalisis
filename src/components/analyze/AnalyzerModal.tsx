import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAnalyzer } from './AnalyzerContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase, supabaseReady, supabaseNotReadyReason } from '@/lib/supabase';
import { uploadVideo, runAnalysis, getQuota } from '@/lib/analyze';
import type { AiResult } from '@/lib/analysis-types';
import { AuthGate } from './AuthGate';
import { UploadForm, type AnalyzeInput } from './UploadForm';
import { ResultView } from './ResultView';

type Step = 'checking' | 'upload' | 'uploading' | 'processing' | 'result' | 'limit' | 'expired' | 'error';

function Processing({ step }: { step: 'uploading' | 'processing' }) {
  return (
    <div className="scanlines mx-auto max-w-md py-10 text-center">
      <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xzk border border-border">
        <div className="absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
        <div className="grid h-full place-items-center">
          <img src="/brand/xzk-symbol.svg" alt="" width={80} height={80} className="opacity-80" />
        </div>
      </div>
      <h3 className="mt-6 text-3xl">
        {step === 'uploading' ? 'A FAZER UPLOAD…' : 'ANALISANDO O CLIP'}
      </h3>
      <p className="mt-2 text-sm text-muted">
        {step === 'uploading'
          ? 'A enviar o vídeo para o servidor…'
          : 'Lendo frame a frame — fala, legenda, música, efeitos e final. Pode levar 1–3 min.'}
      </p>
    </div>
  );
}

function scrollToPlanos() {
  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
}

function FreeLimitBanner({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px', background: '#111111', borderRadius: '12px', border: '1px solid #222222' }}>
      <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</p>
      <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
        Já usaste a tua análise grátis
      </h3>
      <p style={{ color: '#aaaaaa', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
        Para continuares a analisar os teus clips e descobrires o que os faz viralizar, escolhe um plano.
      </p>
      <button
        onClick={() => { onClose(); setTimeout(scrollToPlanos, 150); }}
        className="btn-gold gold-glow rounded-xzk px-7 py-3.5 text-sm transition-all duration-[400ms] ease-out hover:scale-[1.02] hover:shadow-[0_4px_24px_rgba(212,175,55,0.35)] active:scale-[0.98]"
      >
        VER PLANOS
      </button>
    </div>
  );
}

/** Starter plan — daily limit (5/day) */
function StarterLimitBanner({ nextResetAt, onClose }: { nextResetAt: Date | null; onClose: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xzk border border-gold/40 bg-gold/5 p-6 text-center relative">
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-3 right-3 w-7 h-7 rounded-full border border-border bg-surface/60 flex items-center justify-center text-muted hover:text-gold-hi hover:border-gold/40 transition-colors text-xs"
      >
        ✕
      </button>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold mb-3">
        LIMITE DIÁRIO DO PLANO STARTER
      </p>
      <p className="text-sm text-muted mb-4">
        Atingiste as 5 análises de hoje. Volta amanhã ou faz upgrade para Pro para análises ilimitadas.
      </p>
      {nextResetAt && (
        <p className="font-mono text-gold text-sm mb-4">
          Reset às {nextResetAt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onClose} className="btn-ghost rounded-xzk px-5 py-2.5 text-sm font-semibold order-2 sm:order-1">
          ← Voltar
        </button>
        <button onClick={() => { onClose(); setTimeout(scrollToPlanos, 150); }} className="btn-gold rounded-xzk px-6 py-2.5 text-sm order-1 sm:order-2">
          UPGRADE PARA PRO
        </button>
      </div>
    </div>
  );
}

/** Paid plan expired */
function SubscriptionExpiredBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xzk border border-danger/40 bg-danger/5 p-6 text-center relative">
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-3 right-3 w-7 h-7 rounded-full border border-border bg-surface/60 flex items-center justify-center text-muted hover:text-danger hover:border-danger/40 transition-colors text-xs"
      >
        ✕
      </button>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-danger mb-3">
        SUBSCRIÇÃO EXPIRADA
      </p>
      <h3 className="text-2xl mb-3">O teu plano expirou</h3>
      <p className="text-sm text-muted mb-6">
        O teu plano pago expirou. Renova agora para continuar a analisar os teus clips sem limites.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onClose} className="btn-ghost rounded-xzk px-5 py-2.5 text-sm font-semibold order-2 sm:order-1">
          ← Voltar
        </button>
        <button onClick={() => { onClose(); setTimeout(scrollToPlanos, 150); }} className="btn-gold rounded-xzk px-6 py-2.5 text-sm order-1 sm:order-2">
          RENOVAR PLANO
        </button>
      </div>
    </div>
  );
}

export default function AnalyzerModal() {
  const { isOpen, close } = useAnalyzer();
  const { session, plan, loading } = useAuth();
  const [step, setStep]             = useState<Step>('checking');
  const [result, setResult]         = useState<AiResult | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [limitPlan, setLimitPlan]   = useState<string>('free');
  const [nextResetAt, setNextResetAt] = useState<Date | null>(null);

  // Reset to checking whenever the modal opens so we always re-verify quota on open
  useEffect(() => {
    if (isOpen) setStep('checking');
  }, [isOpen]);

  // Pre-check quota — runs when modal opens (step = 'checking') and auth is ready
  useEffect(() => {
    if (!isOpen || !session?.user || loading || step !== 'checking') return;
    let cancelled = false;
    getQuota(session.user.id, plan).then((q) => {
      if (cancelled) return;
      if (q.expired) {
        setStep('expired');
        return;
      }
      if (q.remaining !== null && q.remaining <= 0) {
        setNextResetAt(q.nextResetAt);
        setLimitPlan(plan);
        setStep('limit');
        return;
      }
      setStep('upload');
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session, plan, loading, step]);

  const run = async (input: AnalyzeInput) => {
    if (!session?.user) return;
    setErrorMsg(null);

    try {
      setStep('uploading');
      const videoPath = await uploadVideo(session.user.id, input.video);

      setStep('processing');
      const outcome = await runAnalysis({
        videoPath,
        tema:     input.tema,
        duracao:  input.duracao,
        platform: input.platform,
      });

      if (outcome.ok && outcome.result) {
        setResult(outcome.result);
        setStep('result');
        return;
      }

      // ---- Error handling ---------------------------------------------------
      const err = outcome.error ?? '';

      if (err === 'subscription_expired') {
        setStep('expired');
        return;
      }

      if (err === 'limit_free' || err === 'limit_reached') {
        const resetAt = outcome.next_reset_at ?? (outcome as { next_reset_at?: string }).next_reset_at;
        if (resetAt) setNextResetAt(new Date(resetAt));
        setLimitPlan('free');
        setStep('limit');
        return;
      }

      if (err === 'limit_starter_daily') {
        const resetAt = outcome.next_reset_at;
        if (resetAt) setNextResetAt(new Date(resetAt));
        setLimitPlan('starter');
        setStep('limit');
        return;
      }

      setErrorMsg(
        err === 'gemini_overloaded'
          ? (outcome.message ?? 'A IA está com muita procura agora. O teu clip foi guardado e a análise será feita automaticamente em breve.')
          : (err || 'Não consegui concluir a análise. Tenta de novo.'),
      );
      setStep('error');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado.');
      setStep('error');
    }
  };

  const reset = () => { setResult(null); setNextResetAt(null); setLimitPlan('free'); setStep('checking'); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto bg-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="min-h-full bg-bg px-5 py-6 sm:px-8">
            {/* top bar */}
            <div className="mx-auto flex max-w-3xl items-center justify-between">
              <span className="chip rounded-full px-3 py-1">RAIO-X ClipAnalisis</span>
              <div className="flex items-center gap-3">
                {session && (
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-gold">
                    plano: {plan}
                  </span>
                )}
                {session && (
                  <button onClick={() => supabase.auth.signOut()} className="text-xs text-muted hover:text-gold-hi">
                    sair
                  </button>
                )}
                <button
                  onClick={close}
                  aria-label="Fechar"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-text hover:border-gold/50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-3xl pb-16">
              {!supabaseReady ? (
                <div className="mx-auto max-w-md rounded-xzk border border-border bg-surface/40 p-6 text-center">
                  <h3 className="text-2xl">BACKEND NÃO CONFIGURADO</h3>
                  <p className="mt-3 text-sm text-muted">{supabaseNotReadyReason}</p>
                </div>
              ) : loading ? (
                <p className="py-16 text-center text-muted">Carregando...</p>
              ) : !session ? (
                <AuthGate />
              ) : step === 'checking' ? (
                <p className="py-16 text-center text-muted">Carregando...</p>
              ) : step === 'upload' ? (
                <UploadForm onSubmit={run} />
              ) : step === 'uploading' || step === 'processing' ? (
                <Processing step={step} />
              ) : step === 'result' && result ? (
                <div>
                  <ResultView result={result} />
                  {plan === 'free' ? (
                    <div className="mt-10">
                      <FreeLimitBanner onClose={close} />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setResult(null); setNextResetAt(null); setLimitPlan('free'); setStep('upload'); }}
                      className="btn-ghost mt-10 w-full rounded-xzk px-6 py-3 font-semibold"
                    >
                      ANALISAR OUTRO CLIP
                    </button>
                  )}
                </div>
              ) : step === 'expired' ? (
                <SubscriptionExpiredBanner onClose={close} />
              ) : step === 'limit' ? (
                limitPlan === 'starter' ? (
                  <StarterLimitBanner nextResetAt={nextResetAt} onClose={close} />
                ) : (
                  <FreeLimitBanner onClose={close} />
                )
              ) : (
                <div className="mx-auto max-w-md rounded-xzk border border-danger/40 bg-danger/5 p-6 text-center">
                  <h3 className="text-2xl text-danger">DEU RUIM</h3>
                  <p className="mt-3 text-sm text-muted whitespace-pre-line">{errorMsg}</p>
                  <button onClick={reset} className="btn-gold mt-5 rounded-xzk px-6 py-3">TENTAR DE NOVO</button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
