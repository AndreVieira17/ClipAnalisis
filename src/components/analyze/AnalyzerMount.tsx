import { Suspense, lazy, useEffect, useState } from 'react';
import { useAnalyzer } from './AnalyzerContext';

// Lazy: keeps supabase-js + the whole analyzer out of the initial paint. It is
// only fetched the first time the user opens the analyzer, then stays mounted.
const AnalyzerModal = lazy(() => import('./AnalyzerModal'));

export function AnalyzerMount() {
  const { isOpen } = useAnalyzer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <AnalyzerModal />
    </Suspense>
  );
}
