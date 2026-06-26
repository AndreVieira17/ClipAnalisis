import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AuthGate() {
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'up') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) setMsg('Conta criada! Faz login para entrar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erro ao autenticar.');
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setMsg('Introduz o teu email primeiro'); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://clipanalisis.com' });
    setMsg('Email de redefinição enviado! Verifica a tua caixa de entrada.');
  };

  return (
    <div className="mx-auto max-w-sm">
      <h3 className="text-center text-3xl">
        {mode === 'up' ? 'CRIA TUA CONTA' : 'ENTRA'}
      </h3>
      <p className="mt-2 text-center text-sm text-muted">
        Pra analisar e guardar teu histórico de clips.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="teu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xzk border border-border bg-bg px-4 py-3 text-text outline-none focus:border-gold/50"
        />

        {/* Password with eye toggle — all inline to avoid CSS override */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="senha (mín. 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              padding: '12px 48px 12px 16px',
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '0',
            }}
          >
            {showPassword ? <EyeOff size={20} color="#aaaaaa" /> : <Eye size={20} color="#aaaaaa" />}
          </button>
        </div>

        <button type="submit" disabled={busy} className="btn-gold w-full rounded-xzk px-5 py-3 disabled:opacity-60">
          {busy ? '...' : mode === 'up' ? 'CRIAR CONTA' : 'ENTRAR'}
        </button>
      </form>

      {msg && (
        <p style={{ color: msg.includes('enviado') ? '#D4AF37' : undefined }} className="mt-3 text-center text-sm text-gold">
          {msg}
        </p>
      )}

      <button
        onClick={() => { setMode(mode === 'up' ? 'in' : 'up'); setMsg(null); setShowPassword(false); }}
        className="mt-4 w-full text-center text-sm text-muted hover:text-gold-hi"
      >
        {mode === 'up' ? 'Já tenho conta — entrar' : 'Criar conta nova'}
      </button>

      <button
        type="button"
        onClick={handleForgotPassword}
        className="mt-2 w-full text-center text-sm"
        style={{ color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Esqueceste a senha?
      </button>
    </div>
  );
}
