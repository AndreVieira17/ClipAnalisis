import { useRef, useState } from 'react';
import { Upload, X, Check, AlertTriangle } from 'lucide-react';
import { validateVideo, LIMITS } from '@/lib/analyze';
import { cn, formatBytes } from '@/lib/utils';

export interface AnalyzeInput {
  video: File;
  tema: string;
  platform: string;
  duracao: number;
}

const PLATFORMS = ['TikTok', 'Reels', 'Shorts'];

export function UploadForm({ onSubmit }: { onSubmit: (input: AnalyzeInput) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPrev, setVideoPrev] = useState('');
  const [tema, setTema] = useState('');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [duracao, setDuracao] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleFile = async (f: File | null) => {
    setError(null);
    if (!f) { setVideo(null); setVideoPrev(''); setDuracao(0); return; }
    setChecking(true);
    const [err, secs] = await validateVideo(f);
    setChecking(false);
    if (err) { setError(err); return; }
    setVideo(f);
    setDuracao(secs);
    setVideoPrev(URL.createObjectURL(f));
  };

  const submit = () => {
    if (!video) { setError('Selecciona um vídeo para analisar.'); return; }
    onSubmit({ video, tema: tema.trim() || 'geral', platform, duracao });
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="text-center">
        <h3 className="text-3xl">MANDA O CLIP</h3>
        <p className="mt-2 text-sm text-muted">
          Carrega o vídeo em MP4, MOV ou WEBM. Até {LIMITS.videoMaxSeconds}s e 100 MB.
        </p>
      </div>

      {/* TikTok notice */}
      <div className="flex gap-3 rounded-xzk border border-gold/30 bg-gold/5 p-4">
        <AlertTriangle size={18} className="text-gold shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-text">TikTok, Instagram e YouTube</p>
          <p className="mt-1 text-muted">
            Estas plataformas bloqueiam downloads directos. Usa{' '}
            <strong className="text-text">SnapSave.app</strong>,{' '}
            <strong className="text-text">SSSTik.io</strong> ou o download nativo do TikTok para guardares
            o vídeo no dispositivo. Depois carrega o ficheiro aqui.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          'relative rounded-xzk border-2 border-dashed transition-colors cursor-pointer',
          video
            ? 'border-gold/50 bg-gold/5'
            : 'border-border bg-surface/40 hover:border-gold/40',
        )}
        onClick={() => !video && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !video && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {video && videoPrev ? (
          <div className="relative">
            <video
              src={videoPrev}
              className="w-full h-52 object-cover rounded-[calc(var(--rounded-xzk)-2px)]"
              muted
              onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
              onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs text-white/90 truncate">{video.name}</span>
              <span className="font-mono text-xs text-white/70 ml-2">{formatBytes(video.size)}</span>
            </div>
            <button
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/90"
              onClick={(e) => { e.stopPropagation(); handleFile(null); }}
              aria-label="Remover vídeo"
            >
              <X size={12} />
            </button>
          </div>
        ) : video ? (
          <div className="flex items-center gap-3 p-5">
            <Check size={18} className="text-gold shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-text truncate">{video.name}</p>
              <p className="font-mono text-xs text-muted">{formatBytes(video.size)} · {duracao}s</p>
            </div>
            <button
              className="ml-auto text-muted hover:text-danger"
              onClick={(e) => { e.stopPropagation(); handleFile(null); }}
              aria-label="Remover"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-xzk bg-bg flex items-center justify-center text-muted">
              <Upload size={22} />
            </div>
            <div>
              <p className="font-semibold text-text text-sm">
                {checking ? 'A verificar…' : 'Clica ou arrasta o vídeo aqui'}
              </p>
              <p className="text-xs text-muted mt-1">MP4 / MOV / WEBM · até {LIMITS.videoMaxSeconds}s · até 100 MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Platform + tema */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlatform(p)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${platform === p ? 'btn-gold' : 'btn-ghost'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Nicho / tema (ex.: humor, gameplay, futebol)"
        value={tema}
        onChange={(e) => setTema(e.target.value)}
        className="w-full rounded-xzk border border-border bg-bg px-4 py-3 text-text outline-none focus:border-gold/50 placeholder:text-muted/50"
      />

      {error && (
        <p className="text-center text-sm text-danger">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={checking || !video}
        className="btn-gold gold-glow w-full rounded-xzk px-6 py-4 text-lg disabled:opacity-50"
      >
        FAZER O RAIO-X
      </button>
    </div>
  );
}
