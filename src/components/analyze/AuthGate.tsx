import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ForgotStep = 'hidden' | 'email' | 'code';

export function AuthGate() {
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [forgotStep, setForgotStep] = useState<ForgotStep>('hidden');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

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

  const handleSendOtp = async () => {
    if (!otpEmail) { setMsg('Introduz o teu email primeiro.'); return; }
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({ email: otpEmail });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setMsg(null);
    setForgotStep('code');
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) { setMsg('Introduz o código recebido.'); return; }
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.verifyOtp({ email: otpEmail, token: otpCode, type: 'email' });
    setBusy(false);
    if (error) { setMsg('Código inválido ou expirado.'); return; }
    // success — supabase session is now set, modal will close automatically
    setForgotStep('hidden');
  };

  const inputInline: React.CSSProperties = {
    width: '100%',
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnGoldInline: React.CSSProperties = {
    width: '100%',
    background: '#D4AF37',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '11px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    letterSpacing: '1px',
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

        {/* Password with eye toggle */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="senha (mín. 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputInline, paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: '0' }}
          >
            {showPassword ? <EyeOff size={20} color="#aaaaaa" /> : <Eye size={20} color="#aaaaaa" />}
          </button>
        </div>

        <button type="submit" disabled={busy} className="btn-gold w-full rounded-xzk px-5 py-3 disabled:opacity-60">
          {busy ? '...' : mode === 'up' ? 'CRIAR CONTA' : 'ENTRAR'}
        </button>
      </form>

      {msg && forgotStep === 'hidden' && (
        <p className="mt-3 text-center text-sm text-gold">{msg}</p>
      )}

      <button
        onClick={() => { setMode(mode === 'up' ? 'in' : 'up'); setMsg(null); setShowPassword(false); setForgotStep('hidden'); }}
        className="mt-4 w-full text-center text-sm text-muted hover:text-gold-hi"
      >
        {mode === 'up' ? 'Já tenho conta — entrar' : 'Criar conta nova'}
      </button>

      {/* Forgot password — OTP flow */}
      {forgotStep === 'hidden' && (
        <button
          type="button"
          onClick={() => { setForgotStep('email'); setOtpEmail(email); setMsg(null); }}
          className="mt-2 w-full text-center text-sm"
          style={{ color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Esqueceste a senha?
        </button>
      )}

      {forgotStep === 'email' && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: '#888888', fontSize: '13px', textAlign: 'center', margin: '0 0 4px' }}>
            Envia um código de 6 dígitos para o teu email.
          </p>
          <input
            type="email"
            placeholder="teu@email.com"
            value={otpEmail}
            onChange={e => setOtpEmail(e.target.value)}
            style={inputInline}
          />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}
          <button onClick={handleSendOtp} disabled={busy} style={btnGoldInline}>
            {busy ? '...' : 'ENVIAR CÓDIGO'}
          </button>
          <button
            type="button"
            onClick={() => { setForgotStep('hidden'); setMsg(null); }}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            Cancelar
          </button>
        </div>
      )}

      {forgotStep === 'code' && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: '#888888', fontSize: '13px', textAlign: 'center', margin: '0 0 4px' }}>
            Código enviado para <strong style={{ color: '#D4AF37' }}>{otpEmail}</strong>
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Código de 6 dígitos"
            value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            style={{ ...inputInline, textAlign: 'center', fontSize: '22px', letterSpacing: '8px' }}
          />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}
          <button onClick={handleVerifyOtp} disabled={busy} style={btnGoldInline}>
            {busy ? '...' : 'VERIFICAR CÓDIGO'}
          </button>
          <button
            type="button"
            onClick={() => setForgotStep('email')}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            Reenviar código
          </button>
        </div>
      )}
    </div>
  );
}
