import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
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
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">
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
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
            Password
          </label>
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              {showPassword ? <EyeOff size={20} color="#ffffff" /> : <Eye size={20} color="#ffffff" />}
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <p className={`text-sm rounded-lg px-3 py-2 border ${
            message.type === 'error'
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : 'text-green-400 bg-green-500/10 border-green-500/20'
          }`}>
            {message.text}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-lg px-6 py-3 text-sm font-bold text-black transition-colors disabled:opacity-60"
          style={{ background: loading ? '#a07d1a' : '#D4AF37' }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#c9a227'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#D4AF37'; }}
        >
          {loading ? 'A aguardar…' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
        </button>
      </form>

      {/* Mode switch */}
      <p className="mt-5 text-center text-sm text-zinc-500">
        {mode === 'login' ? 'Ainda não tens conta?' : 'Já tens conta?'}{' '}
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); setShowPassword(false); }}
          className="font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#D4AF37' }}
        >
          {mode === 'login' ? 'Criar conta nova' : 'Já tenho conta — entrar'}
        </button>
      </p>

      {/* Forgot password — login only */}
      {mode === 'login' && (
        <p className="mt-3 text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: '#D4AF37' }}
          >
            Esqueceste a senha?
          </button>
        </p>
      )}
    </AuthLayout>
  );
}
