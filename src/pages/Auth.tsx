import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const handleForgotPassword = async () => {
    if (!email) { setMessage('Introduz o teu email primeiro'); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://clipanalisis.com' });
    setMessage('Email de redefinição enviado! Verifica a tua caixa de entrada.');
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
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', padding: '14px 16px', color: '#ffffff', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }}
        />

        <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="senha (mín. 6)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', padding: '14px 48px 14px 16px', color: '#ffffff', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: '0' }}
          >
            {showPassword
              ? <EyeOff size={20} color="#aaaaaa" />
              : <Eye size={20} color="#aaaaaa" />
            }
          </button>
        </div>

        {message && (
          <p style={{ color: message.includes('enviado') ? '#D4AF37' : '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', background: '#D4AF37', color: '#000000', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px', marginBottom: '16px' }}
        >
          {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '12px' }}>
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); setShowPassword(false); }}
            style={{ color: '#D4AF37', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Criar conta nova' : 'Já tenho conta — entrar'}
          </span>
        </p>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: '13px' }}>
            <span onClick={handleForgotPassword} style={{ color: '#D4AF37', cursor: 'pointer' }}>
              Esqueceste a senha?
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
