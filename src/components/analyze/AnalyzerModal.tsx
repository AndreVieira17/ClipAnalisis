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

type Step = 'upload' | 'uploading' | 'processing' | 'result' | 'limit' | 'error';

const LIMIT_COPY: Record<string, string> = {
  free: 'Já usaste a tua análise gratuita hoje. Assina um plano para continuar.',
  starter: 'Atingiste o limite de 10 análises este mês. Faz upgrade para Pro.',
};

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

export default function AnalyzerModal() {
  const { isOpen, close } = useAnalyzer();
  const { session, plan, loading } = useAuth();
  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<AiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [limitPlan, setLimitPlan] = useState<string>('free');

  // Pre-check quota before the user even starts uploading
  useEffect(() => {
    if (!isOpen || !session?.user || loading || step !== 'upload') return;
    let cancelled = false;
    getQuota(session.user.id, plan).then((q) => {
      if (cancelled) return;
      if (q.remaining !== null && q.remaining <= 0) {
        setLimitPlan(plan);
        setStep('limit');
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session, plan, loading]);

  const run = async (input: AnalyzeInput) => {
    if (!session?.user) return;
    setErrorMsg(null);

    try {
      // Step A: upload the video file
      setStep('uploading');
      const videoPath = await uploadVideo(session.user.id, input.video);

      // Step B: edge function runs Gemini + inserts row
      setStep('processing');
      const outcome = await runAnalysis({
        videoPath,
        tema: input.tema,
        duracao: input.duracao,
        platform: input.platform,
      });

      if (outcome.ok && outcome.result) {
        setResult(outcome.result);
        setStep('result');
        return;
      }
      if (outcome.error === 'limit_reached') {
        setLimitPlan(plan);
        setStep('limit');
        return;
      }
      setErrorMsg(
        outcome.error === 'gemini_overloaded'
          ? (outcome.message ?? 'A IA está com muita procura agora. O teu clip foi guardado e a análise será feita automaticamente em breve. Não perdes a tua análise.')
          : (outcome.error ?? 'Não consegui concluir a análise. Tenta de novo.'),
      );
      setStep('error');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado.');
      setStep('error');
    }
  };

  const reset = () => { setResult(null); setStep('upload'); };

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
                  <p className="mt-2 text-xs text-muted/60">
                    Verifica <code className="text-gold">.env.local</code> —{' '}
                    <code className="text-gold">VITE_SUPABASE_URL</code> deve ser{' '}
                    <code className="text-gold">https://xxxx.supabase.co</code> e{' '}
                    <code className="text-gold">VITE_SUPABASE_ANON_KEY</code> começa com "eyJ".
                  </p>
                </div>
              ) : loading ? (
                <p className="py-16 text-center text-muted">Carregando...</p>
              ) : !session ? (
                <AuthGate />
              ) : step === 'upload' ? (
                <UploadForm onSubmit={run} />
              ) : step === 'uploading' || step === 'processing' ? (
                <Processing step={step} />
              ) : step === 'result' && result ? (
                <div>
                  <ResultView result={result} />
                  <button onClick={reset} className="btn-ghost mt-10 w-full rounded-xzk px-6 py-3 font-semibold">
                    ANALISAR OUTRO CLIP
                  </button>
                </div>
              ) : step === 'limit' ? (
                <div className="mx-auto max-w-md rounded-xzk border border-gold/40 bg-surface/40 p-6 text-center">
                  <h3 className="text-2xl">LIMITE DO PLANO</h3>
                  <p className="mt-3 text-sm text-muted">{LIMIT_COPY[limitPlan] ?? 'Limite atingido.'}</p>
                  <a href="#planos" onClick={close} className="btn-gold mt-5 inline-block rounded-xzk px-6 py-3">
                    VER PLANOS
                  </a>
                </div>
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
