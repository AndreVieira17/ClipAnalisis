import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const { fontFamily: anton } = loadAnton();
const { fontFamily: mono } = loadMono();

const GOLD = '#D4AF37';
const GOLD_HI = '#F6E08A';
const WORDS = ['ISSO', 'AQUI', 'VAI', 'VIRALIZAR'];

/** Word-by-word caption pop. White words, the keyword in gold. */
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        {WORDS.map((w, i) => {
          const start = 12 + i * 12;
          const s = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 180 } });
          const isKey = w === 'VIRALIZAR';
          return (
            <span
              key={w}
              style={{
                fontFamily: anton,
                fontSize: isKey ? 150 : 96,
                letterSpacing: -3,
                textTransform: 'uppercase',
                color: isKey ? GOLD : '#F5F3EC',
                transform: `scale(${s})`,
                opacity: s,
                textShadow: isKey ? `0 0 40px rgba(212,175,55,0.6)` : 'none',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Gold scanner sweeping top→bottom. */
const Scanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const y = interpolate(frame % durationInFrames, [0, durationInFrames], [-200, 1280]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        height: 160,
        background: `linear-gradient(180deg, transparent, rgba(212,175,55,0.45), transparent)`,
      }}
    />
  );
};

/** Waveform reacting to a drop. */
const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = 28;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 180,
        left: 0,
        right: 0,
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 320,
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const drop = interpolate(frame, [60, 90], [0.3, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        const h = (Math.abs(Math.sin(i * 0.6 + frame * 0.18)) * 220 + 30) * drop;
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: h,
              borderRadius: 8,
              background: `linear-gradient(180deg, ${GOLD_HI}, ${GOLD})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Rising metric in mono gold. */
const RisingNumber: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [40, 200], [0, 312], { extrapolateRight: 'clamp' }));
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 64,
        color: GOLD,
        textShadow: '0 0 30px rgba(212,175,55,0.5)',
      }}
    >
      +{v}% RETENÇÃO
    </div>
  );
};

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // micro-glitch at the loop seam to tie the cut back to the start
  const seam = durationInFrames - 8;
  const glitchX = frame > seam ? Math.sin(frame * 9) * 8 : 0;
  const glitchOpacity = frame > seam ? 0.6 : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0B', transform: `translateX(${glitchX}px)`, opacity: glitchOpacity }}>
      {/* subtle grain via repeating radial */}
      <AbsoluteFill style={{ opacity: 0.04, background: 'radial-gradient(circle, #fff 0.5px, transparent 0.6px)', backgroundSize: '3px 3px' }} />
      <Waveform />
      <Sequence from={6}>
        <Captions />
      </Sequence>
      <Scanner />
      <RisingNumber />
    </AbsoluteFill>
  );
};
