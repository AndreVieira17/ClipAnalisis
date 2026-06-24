import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-[var(--app-radius-lg)] bg-app-error/10 flex items-center justify-center text-app-error text-xl mb-4">
          ✕
        </div>
        <h1 className="font-grotesk font-bold text-app-text-primary text-xl mb-2">Algo correu mal</h1>
        <p className="font-inter text-app-text-muted text-sm max-w-sm mb-6">{this.state.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="font-inter text-sm text-app-accent hover:text-app-accent-hover transition-colors"
        >
          Recarregar página →
        </button>
      </div>
    );
  }
}
