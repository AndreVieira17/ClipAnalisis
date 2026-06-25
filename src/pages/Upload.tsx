import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, AlertTriangle, Clock, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { uploadVideo, runAnalysis, validateVideo, getQuota, LIMITS } from '@/lib/analyze';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useAppToast } from '@/hooks/useAppToast';
import { cn, formatBytes } from '@/lib/utils';

type Step = 1 | 2 | 3;
const PLATFORMS = ['TikTok', 'Reels', 'Shorts'] as const;

/** Countdown that ticks every second from a target Date. Returns "HH:MM:SS" or null when done. */
function useCountdown(target: Date | null): string | null {
  const calc = useCallback(() => {
    if (!target) return null;
    const diff = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
    if (diff === 0) return null;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [target]);

  const [display, setDisplay] = useState<string | null>(calc);
  useEffect(() => {
    setDisplay(calc());
    const id = setInterval(() => setDisplay(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return display;
}

function QuotaBanner({ nextResetAt }: { nextResetAt: Date }) {
  const countdown = useCountdown(nextResetAt);
  if (!countdown) return null;
  return (
    <div className="flex items-center gap-3 rounded-[var(--app-radius-lg)] border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
      <Clock size={16} className="text-amber-500 shrink-0" />
      <div>
        <p className="font-inter font-semibold text-app-text-primary text-sm">
          Limite diário atingido
        </p>
        <p className="font-inter text-app-text-muted text-xs mt-0.5">
          Próxima análise disponível em{' '}
          <span className="font-mono font-bold text-amber-400">{countdown}</span>
        </p>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps = ['Upload', 'Configurar', 'Analisar'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const done = current > n;
        const active = current === n;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors',
                done ? 'bg-app-success text-white' : active ? 'bg-app-accent text-white' : 'bg-app-bg-hover text-app-text-muted',
              )}>
                {done ? <Check size={14} /> : n}
              </div>
              <span className={cn(
                'text-sm font-inter font-medium transition-colors',
                active ? 'text-app-text-primary' : 'text-app-text-muted',
              )}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('h-px w-12 mx-3', current > n ? 'bg-app-success' : 'bg-app-border-default')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Upload() {
  const { session, plan, subscriptionActive } = useAuth();
  const navigate = useNavigate();
  const { toast } = useAppToast();

  const [step, setStep] = useState<Step>(1);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPrev, setVideoPrev] = useState('');
  const [duracao, setDuracao] = useState(0);
  const [platform, setPlatform] = useState<string>('TikTok');
  const [tema, setTema] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [nextResetAt, setNextResetAt] = useState<Date | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check quota on mount for Free / Starter plans
  useEffect(() => {
    if (!session?.user || plan === 'pro' || plan === 'elite') return;
    getQuota(session.user.id, plan).then((q) => {
      if (q.nextResetAt) setNextResetAt(q.nextResetAt);
    });
  }, [session, plan]);

  // Block if: free plan with daily quota used, OR paid plan with expired/missing subscription
  const isQuotaBlocked = plan === 'free' && nextResetAt !== null;
  const isSubBlocked = plan !== 'free' && !subscriptionActive;
  const isBlocked = isQuotaBlocked || isSubBlocked;

  const handleVideoChange = async (f: File | null) => {
    setValidationError(null);
    if (!f) { setVideo(null); setVideoPrev(''); setDuracao(0); return; }
    const [err, secs] = await validateVideo(f);
    if (err) { setValidationError(err); return; }
    setVideo(f);
    setDuracao(secs);
    setVideoPrev(URL.createObjectURL(f));
  };

  async function goToStep2() {
    if (!video) { setValidationError('Carrega um vídeo para continuar.'); return; }
    setValidationError(null);
    setStep(2);
  }

  async function startAnalyze() {
    if (!session?.user || !video) return;
    setLoading(true);
    setProgress(5);
    try {
      setProgressLabel('A fazer upload do vídeo…');
      setProgress(20);
      const videoPath = await uploadVideo(session.user.id, video);

      setProgressLabel('Gemini a analisar frame a frame…');
      setProgress(50);
      const outcome = await runAnalysis({
        videoPath,
        tema: tema.trim() || 'geral',
        duracao,
        platform,
      });

      setProgress(100);

      if (outcome.ok && outcome.analysisId) {
        toast('Análise concluída! Raio-X pronto.', 'success');
        navigate(`/app/analysis/${outcome.analysisId}`);
      } else if (outcome.error === 'limit_reached') {
        const resetAt = (outcome as { next_reset_at?: string }).next_reset_at;
        if (resetAt && plan === 'free') setNextResetAt(new Date(resetAt));
        setShowUpgradeModal(true);
      } else if (outcome.error === 'gemini_overloaded') {
        toast(
          outcome.message ?? 'A IA está com muita procura. O teu clip foi guardado e a análise será feita em breve.',
          'warning',
        );
        navigate('/app/library');
      } else {
        toast(outcome.error ?? 'Erro na análise. Tenta novamente.', 'error');
        setStep(3);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro inesperado.', 'error');
      setStep(3);
    } finally {
      setLoading(false);
      setProgressLabel('');
    }
  }

  const inputClass = 'w-full bg-app-bg-primary border border-app-border-default rounded-[var(--app-radius-md)] px-3 py-2.5 text-sm font-inter text-app-text-primary placeholder:text-app-text-muted outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-colors';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={isSubBlocked ? 'subscription_expired' : 'limit_reached'}
      />

      <h1 className="font-grotesk font-bold text-app-text-primary text-2xl mb-2">Nova análise</h1>
      <p className="font-inter text-app-text-muted text-sm mb-8">
        Envia o teu clip e recebe o raio-X de viralização.
      </p>

      {nextResetAt && <QuotaBanner nextResetAt={nextResetAt} />}
      <StepIndicator current={step} />

      {/* ── Step 1: Upload ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* TikTok notice */}
          <div className="flex gap-3 rounded-[var(--app-radius-lg)] border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="font-inter text-xs text-app-text-muted">
              <strong className="text-app-text-secondary">TikTok / Instagram / YouTube:</strong>{' '}
              não é possível analisar por link. Usa <strong>SnapSave.app</strong> ou <strong>SSSTik.io</strong>{' '}
              para descarregar o vídeo e depois carrega o ficheiro aqui.
            </p>
          </div>

          {/* Drop zone */}
          <div
            className={cn(
              'relative rounded-[var(--app-radius-lg)] border-2 border-dashed transition-colors cursor-pointer',
              video
                ? 'border-app-success/40 bg-app-success/5'
                : 'border-app-border-default bg-app-bg-card hover:border-app-accent/50',
            )}
            onClick={() => !video && document.getElementById('video-input')?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleVideoChange(e.dataTransfer.files[0] ?? null); }}
            role="button"
            tabIndex={0}
          >
            <input
              id="video-input"
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
            />
            {video && videoPrev ? (
              <div className="relative">
                <video
                  src={videoPrev}
                  className="w-full h-48 object-cover rounded-[calc(var(--app-radius-lg)-2px)]"
                  muted
                  onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-[calc(var(--app-radius-lg)-2px)]" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-inter text-xs text-white/90 truncate">{video.name}</span>
                  <span className="font-mono text-xs text-white/70 ml-2">{formatBytes(video.size)} · {duracao}s</span>
                </div>
                <button
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80"
                  onClick={(e) => { e.stopPropagation(); handleVideoChange(null); }}
                  aria-label="Remover"
                >✕</button>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-[var(--app-radius-md)] bg-app-bg-hover flex items-center justify-center text-app-text-muted">
                  <Zap size={22} />
                </div>
                <div>
                  <p className="font-grotesk font-semibold text-app-text-primary text-sm">Clica ou arrasta o vídeo aqui</p>
                  <p className="font-inter text-app-text-muted text-xs mt-1">MP4 / MOV / WEBM · até {LIMITS.videoMaxSeconds}s · até 100 MB</p>
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <p className="font-inter text-sm text-app-error bg-app-error/10 rounded-[var(--app-radius-sm)] px-3 py-2 border border-app-error/20">
              {validationError}
            </p>
          )}
          <Button variant="primary" size="lg" className="w-full" onClick={goToStep2} disabled={!video}>
            Continuar
          </Button>
        </div>
      )}

      {/* ── Step 2: Configure ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-inter font-medium text-app-text-secondary mb-2.5">Plataforma</p>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-inter font-medium transition-colors border',
                    platform === p
                      ? 'bg-app-accent text-white border-app-accent'
                      : 'bg-transparent text-app-text-muted border-app-border-default hover:border-app-accent/50',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="tema" className="block text-xs font-inter font-medium text-app-text-secondary mb-1.5">
              Nicho / tema <span className="text-app-text-muted">(opcional)</span>
            </label>
            <input
              id="tema"
              type="text"
              placeholder="ex: humor, gameplay, futebol, lifestyle…"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
            <Button variant="primary" size="lg" onClick={() => setStep(3)} className="flex-1">Continuar</Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Analyse ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-app-bg-card border border-app-border-subtle rounded-[var(--app-radius-lg)] p-5 space-y-3">
            <p className="font-grotesk font-semibold text-app-text-primary text-sm">Resumo</p>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="font-inter text-app-text-muted w-24 shrink-0">Vídeo</dt>
                <dd className="font-inter text-app-text-primary truncate">{video?.name ?? '—'}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-inter text-app-text-muted w-24 shrink-0">Duração</dt>
                <dd className="font-inter text-app-text-primary">{duracao}s</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-inter text-app-text-muted w-24 shrink-0">Plataforma</dt>
                <dd className="font-inter text-app-text-primary">{platform}</dd>
              </div>
              {tema && (
                <div className="flex gap-3">
                  <dt className="font-inter text-app-text-muted w-24 shrink-0">Tema</dt>
                  <dd className="font-inter text-app-text-primary">{tema}</dd>
                </div>
              )}
            </dl>
          </div>

          {loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-app-accent/30 border-t-app-accent animate-spin shrink-0" />
                <p className="font-inter text-sm text-app-text-secondary">{progressLabel || 'A analisar…'}</p>
              </div>
              <ProgressBar value={progress} animated={progress < 100} variant="accent" />
              <p className="font-mono text-xs text-app-text-muted">Pode levar 1–3 minutos. Não feches a janela.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" disabled={loading} onClick={() => setStep(2)} className="flex-1">
              Voltar
            </Button>
            {isBlocked ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowUpgradeModal(true)}
                className="flex-1 gap-2 border-amber-500/40 text-amber-400 hover:border-amber-500/70"
              >
                <Lock size={16} />
                {isSubBlocked ? 'Renovar subscrição' : 'Fazer upgrade'}
              </Button>
            ) : (
              <Button variant="primary" size="lg" loading={loading} onClick={startAnalyze} className="flex-1 gap-2">
                <Zap size={16} />
                Analisar com Gemini
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
