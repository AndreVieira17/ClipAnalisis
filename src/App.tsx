import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyzerProvider } from '@/components/analyze/AnalyzerContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

// Landing — eager (it's the first thing users see)
import Landing from '@/pages/Landing';

// App pages — lazy loaded (only fetched after auth)
const Auth         = lazy(() => import('@/pages/Auth'));
const Dashboard    = lazy(() => import('@/pages/Dashboard'));
const Upload       = lazy(() => import('@/pages/Upload'));
const Library      = lazy(() => import('@/pages/Library'));
const Settings     = lazy(() => import('@/pages/Settings'));
const AnalysisView = lazy(() => import('@/pages/AnalysisView'));

function AppSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-app-bg-primary flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-app-accent/30 border-t-app-accent animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route
            path="/"
            element={
              <AnalyzerProvider>
                <Landing />
              </AnalyzerProvider>
            }
          />
          <Route
            path="/auth"
            element={
              <AppSuspense>
                <Auth />
              </AppSuspense>
            }
          />

          {/* ── Authenticated app ── */}
          <Route
            path="/app"
            element={
              <AuthGuard>
                <AppLayout>
                  <AppSuspense>
                    <Navigate to="/app/dashboard" replace />
                  </AppSuspense>
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/app/dashboard"
            element={
              <AuthGuard>
                <AppLayout>
                  <AppSuspense>
                    <Dashboard />
                  </AppSuspense>
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/app/upload"
            element={
              <AuthGuard>
                <AppLayout>
                  <AppSuspense>
                    <Upload />
                  </AppSuspense>
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/app/library"
            element={
              <AuthGuard>
                <AppLayout>
                  <AppSuspense>
                    <Library />
                  </AppSuspense>
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/app/settings"
            element={
              <AuthGuard>
                <AppLayout>
                  <AppSuspense>
                    <Settings />
                  </AppSuspense>
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/app/analysis/:id"
            element={
              <AuthGuard>
                <AppLayout>
                  <AppSuspense>
                    <AnalysisView />
                  </AppSuspense>
                </AppLayout>
              </AuthGuard>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
