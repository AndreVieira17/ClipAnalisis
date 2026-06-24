import { useEffect, useState } from 'react';

/**
 * Tracks the user's `prefers-reduced-motion` setting reactively.
 * Used to switch off tilt/lift, swap hero video for poster and shorten reveals.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}
