import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyzerProvider } from '@/components/analyze/AnalyzerContext';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { LanguageProvider } from '@/lib/i18n';

import Landing from '@/pages/Landing';

const Auth      = lazy(() => import('@/pages/Auth'));
const Historico = lazy(() => import('@/pages/Historico'));
const AnaliseView   = lazy(() => import('@/pages/AnaliseView'));

function Spinner() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ── Landing (com analyzer modal) ── */}
          <Route
            path="/"
            element={
              <AnalyzerProvider>
                <Landing />
              </AnalyzerProvider>
            }
          />

          {/* ── Auth ── */}
          <Route
            path="/auth"
            element={
              <Suspense fallback={<Spinner />}>
                <Auth />
              </Suspense>
            }
          />

          {/* ── Histórico de clips ── */}
          <Route
            path="/historico"
            element={
              <Suspense fallback={<Spinner />}>
                <Historico />
              </Suspense>
            }
          />

          {/* ── Resultado de uma análise específica ── */}
          <Route
            path="/analise/:id"
            element={
              <Suspense fallback={<Spinner />}>
                <AnaliseView />
              </Suspense>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
    </LanguageProvider>
  );
}
