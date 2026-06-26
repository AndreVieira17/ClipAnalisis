import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

type ForgotStep = 'hidden' | 'email' | 'code';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [forgotStep, setForgotStep] = useState<ForgotStep>('hidden');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setMessage(error.message); setLoading(false); return; }
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginError) navigate('/');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage(error.message); setLoading(false); return; }
      navigate('/');
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!otpEmail) { setMessage('Introduz o teu email primeiro.'); return; }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email: otpEmail });
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    setForgotStep('code');
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) { setMessage('Introduz o código recebido.'); return; }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.verifyOtp({ email: otpEmail, token: otpCode, type: 'email' });
    setLoading(false);
    if (error) { setMessage('Código inválido ou expirado.'); return; }
    navigate('/');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const btnGoldStyle: React.CSSProperties = {
    width: '100%',
    background: '#D4AF37',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    letterSpacing: '1px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '40px 32px' }}>

        <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '8px', letterSpacing: '2px' }}>
          {mode === 'login' ? 'ENTRA' : 'CRIA TUA CONTA'}
        </h1>
        <p style={{ color: '#888888', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>
          Pra analisar e guardar teu histórico de clips.
        </p>

        <input
          type="email"
          placeholder="teu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: '12px' }}
        />

        <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="senha (mín. 6)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, padding: '14px 48px 14px 16px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: '0' }}
          >
            {showPassword ? <EyeOff size={20} color="#aaaaaa" /> : <Eye size={20} color="#aaaaaa" />}
          </button>
        </div>

        {message && forgotStep === 'hidden' && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{ ...btnGoldStyle, marginBottom: '16px', opacity: loading ? 0.6 : 1 }}>
          {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '8px' }}>
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); setShowPassword(false); setForgotStep('hidden'); }}
            style={{ color: '#D4AF37', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Criar conta nova' : 'Já tenho conta — entrar'}
          </span>
        </p>

        {/* Forgot password — OTP flow */}
        {forgotStep === 'hidden' && (
          <p style={{ textAlign: 'center', fontSize: '13px' }}>
            <span
              onClick={() => { setForgotStep('email'); setOtpEmail(email); setMessage(''); }}
              style={{ color: '#D4AF37', cursor: 'pointer' }}
            >
              Esqueceste a senha?
            </span>
          </p>
        )}

        {forgotStep === 'email' && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: '#888888', fontSize: '13px', textAlign: 'center', margin: '0 0 4px' }}>
              Envia um código de 6 dígitos para o teu email.
            </p>
            <input
              type="email"
              placeholder="teu@email.com"
              value={otpEmail}
              onChange={e => setOtpEmail(e.target.value)}
              style={inputStyle}
            />
            {message && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{message}</p>}
            <button onClick={handleSendOtp} disabled={loading} style={{ ...btnGoldStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? '...' : 'ENVIAR CÓDIGO'}
            </button>
            <button
              type="button"
              onClick={() => { setForgotStep('hidden'); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}
            >
              Cancelar
            </button>
          </div>
        )}

        {forgotStep === 'code' && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              style={{ ...inputStyle, textAlign: 'center', fontSize: '22px', letterSpacing: '8px' }}
            />
            {message && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{message}</p>}
            <button onClick={handleVerifyOtp} disabled={loading} style={{ ...btnGoldStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? '...' : 'VERIFICAR CÓDIGO'}
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
    </div>
  );
}
