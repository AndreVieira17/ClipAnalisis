/** Static fallback for weak/reduced-motion devices — no WebGL cost. */
export function HeroObjectFallback() {
  return (
    <div className="animate-float [animation-duration:7s] flex h-full w-full flex-col items-center justify-center gap-4">
      {/* Gold monogram icon */}
      <img
        src="/brand/xzk-symbol.svg"
        alt="ClipAnalisis"
        width={180}
        height={180}
        className="drop-shadow-[0_18px_50px_rgba(212,175,55,0.4)]"
      />
      {/* Wordmark below the icon */}
      <span
        className="gold-foil font-display text-xl font-bold leading-none tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        ClipAnalisis
      </span>
    </div>
  );
}
