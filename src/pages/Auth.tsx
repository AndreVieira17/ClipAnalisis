import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { supabase, supabaseReady, supabaseNotReadyReason } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseReady) {
      setMessage({ text: supabaseNotReadyReason ?? 'Backend não configurado.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setMessage({ text: signUpError.message, type: 'error' });
      } else {
        // Auto sign-in immediately after signup — no email confirmation required
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Signup worked but auto-login failed (e.g. email confirmation still enabled in Supabase)
          setMessage({
            text: 'Conta criada! Faz login para entrar.',
            type: 'success',
          });
          setMode('login');
        } else {
          // Fire-and-forget — don't block navigation if email fails
          supabase.functions.invoke('send-welcome-email', { body: { email } }).catch(() => {});
          navigate('/', { replace: true });
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        navigate('/', { replace: true });
      }
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage({ text: 'Introduz o teu email primeiro.', type: 'error' });
      return;
    }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://clipanalisis.com',
    });
    setMessage({ text: 'Email de redefinição enviado! Verifica a tua caixa de entrada.', type: 'success' });
  }

  const inputClass =
    'w-full bg-app-bg-primary border border-app-border-default rounded-[var(--app-radius-md)] px-3 py-2.5 text-sm font-inter text-app-text-primary placeholder:text-app-text-muted outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-colors';

  return (
    <AuthLayout
      title={mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
      subtitle={
        mode === 'login'
          ? 'Acede às tuas análises e histórico de clips.'
          : 'Começa grátis — sem cartão de crédito.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-inter font-medium text-app-text-secondary mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-inter font-medium text-app-text-secondary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {mode === 'login' && (
            <div className="mt-1.5 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#D4AF37] hover:text-[#f0d060] transition-colors"
              >
                Esqueceste a senha?
              </button>
            </div>
          )}
        </div>

        {message && (
          <p
            className={`text-sm font-inter rounded-[var(--app-radius-sm)] px-3 py-2 ${
              message.type === 'error'
                ? 'text-app-error bg-app-error/10 border border-app-error/20'
                : 'text-app-success bg-app-success/10 border border-app-success/20'
            }`}
          >
            {message.text}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-inter text-app-text-muted">
        {mode === 'login' ? 'Ainda não tens conta?' : 'Já tens conta?'}{' '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}
          className="text-app-accent hover:text-app-accent-hover font-medium transition-colors"
        >
          {mode === 'login' ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </AuthLayout>
  );
}
