interface BrandMarkProps {
  className?: string;
  /** px size of the square symbol */
  size?: number;
  withWordmark?: boolean;
}

/**
 * ClipAnalisis symbol. Uses the SVG asset in /public/brand (swap with the real profile
 * logo). On hover it gets a subtle chromatic-glitch shift. Falls back cleanly
 * to the placeholder monogram baked into the SVG if no real asset is provided.
 */
export function BrandMark({ className = '', size = 40, withWordmark = false }: BrandMarkProps) {
  return (
    <span className={`group/brand inline-flex items-center gap-3 ${className}`}>
      <span className="relative inline-block" style={{ width: size, height: size }}>
        {/* chromatic ghosts revealed on hover */}
        <img
          src="/brand/xzk-symbol.svg"
          alt=""
          aria-hidden
          width={size}
          height={size}
          className="absolute inset-0 opacity-0 mix-blend-screen transition-all duration-150 [filter:hue-rotate(-20deg)] group-hover/brand:translate-x-[2px] group-hover/brand:opacity-60"
        />
        <img
          src="/brand/xzk-symbol.svg"
          alt=""
          aria-hidden
          width={size}
          height={size}
          className="absolute inset-0 opacity-0 mix-blend-screen transition-all duration-150 [filter:hue-rotate(20deg)] group-hover/brand:-translate-x-[2px] group-hover/brand:opacity-60"
        />
        <img
          src="/brand/xzk-symbol.svg"
          alt="ClipAnalisis"
          width={size}
          height={size}
          className="relative drop-shadow-[0_0_14px_rgba(212,175,55,0.35)]"
        />
      </span>
      {withWordmark && (
        <span className="gold-foil font-display text-2xl leading-none tracking-tightest">ClipAnalisis</span>
      )}
    </span>
  );
}
