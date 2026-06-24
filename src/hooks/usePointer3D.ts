import { useCallback, useEffect, useRef } from 'react';

interface Options {
  /** max tilt in degrees toward the pointer */
  maxTilt?: number;
  /** Z translation in px when held — this is the "pop out toward you" */
  lift?: number;
  /** extra scale while held */
  liftScale?: number;
}

/**
 * ★ Camada A — "pop-out toward pointer".
 *
 * Unifies pointermove/down/up (mouse + touch) into a single 3D behaviour:
 * the element tilts toward the pointer and, while pressed/held, jumps forward
 * (+translateZ) toward the cursor/finger while its shadow stretches the
 * opposite way to sell the "lifted off the table toward you" feel.
 *
 * All work is done on `transform` only (60fps, no layout thrash). We write
 * styles imperatively via ref to avoid re-rendering on every pointer frame.
 * Respects `prefers-reduced-motion`: tilt/lift are disabled there.
 */
export function usePointer3D({ maxTilt = 12, lift = 60, liftScale = 1.04 }: Options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const held = useRef(false);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => (reduced.current = mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const apply = useCallback((rx: number, ry: number, tz: number, s: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px) scale(${s})`;
    const shadow = shadowRef.current;
    if (shadow) {
      // shadow leans opposite to the tilt and grows while lifted
      const liftRatio = tz / lift;
      shadow.style.transform = `translate3d(${-ry * 1.6}px, ${rx * 1.6 + 14}px, 0) scale(${1 + liftRatio * 0.12})`;
      shadow.style.opacity = `${0.35 + liftRatio * 0.4}`;
    }
  }, [lift]);

  const reset = useCallback(() => {
    held.current = false;
    if (reduced.current) return;
    apply(0, 0, 0, 1);
  }, [apply]);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduced.current) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      // clamp to keep the effect tasteful near the edges
      const cx = Math.max(-1, Math.min(1, px));
      const cy = Math.max(-1, Math.min(1, py));
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        apply(
          -cy * maxTilt,
          cx * maxTilt,
          held.current ? lift : 0,
          held.current ? liftScale : 1,
        );
      });
    },
    [apply, maxTilt, lift, liftScale],
  );

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if (reduced.current) return;
      held.current = true;
      // capture so we keep tracking even if pointer leaves the element while held
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      onMove(e);
    },
    [onMove],
  );

  return { ref, shadowRef, onMove, onPointerDown: onDown, onPointerUp: reset, onPointerLeave: reset };
}
