import { Suspense, lazy, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { HeroObjectFallback } from './HeroObjectFallback';

// R3F + three are heavy: keep them out of the initial bundle entirely.
const HeroObject = lazy(() => import('./HeroObject'));

/**
 * Capability gate for Camada B. We only mount the real 3D when:
 *  - reduced-motion is OFF,
 *  - the device isn't obviously weak (low core count / coarse small screen),
 *  - and the section is in view (deferred mount avoids paying on first paint).
 * Otherwise we show the static gold fallback. The 3D is never a prerequisite.
 */
export function HeroCanvas() {
  const reduced = usePrefersReducedMotion();
  const [allow3D, setAllow3D] = useState(false);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (reduced) {
      setAllow3D(false);
      return;
    }
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const tinyMobile = window.matchMedia('(max-width: 480px)').matches && cores <= 4;
    const weak = cores <= 2 || mem <= 2 || tinyMobile;
    setAllow3D(!weak);
  }, [reduced]);

  // defer the heavy import until the browser is idle
  useEffect(() => {
    if (!allow3D) return;
    const ric =
      (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 600));
    const id = ric(() => setMount(true));
    return () => {
      if (typeof id === 'number') clearTimeout(id);
    };
  }, [allow3D]);

  if (!allow3D || !mount) return <HeroObjectFallback />;

  return (
    <Suspense fallback={<HeroObjectFallback />}>
      <HeroObject />
    </Suspense>
  );
}
