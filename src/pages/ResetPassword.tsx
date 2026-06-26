import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the recovery token in the URL hash is valid
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      setIsError(true);
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage('Senha alterada com sucesso! A redirecionar…');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  const eyeButtonStyle = (right = '14px'): React.CSSProperties => ({
    position: 'absolute',
    right,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '0',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '14px 48px 14px 16px',
    color: '#ffffff',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '40px 32px' }}>

        <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '8px', letterSpacing: '2px' }}>
          NOVA SENHA
        </h1>
        <p style={{ color: '#888888', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>
          {ready ? 'Escolhe a tua nova senha.' : 'A verificar o link de recuperação…'}
        </p>

        {!ready ? (
          <div style={{ textAlign: 'center', color: '#D4AF37', fontSize: '14px' }}>
            A aguardar confirmação do Supabase…
          </div>
        ) : (
          <>
            {/* Nova senha */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Nova senha (mín. 6)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowNew(v => !v)} style={eyeButtonStyle()}>
                {showNew ? <EyeOff size={20} color="#aaaaaa" /> : <Eye size={20} color="#aaaaaa" />}
              </button>
            </div>

            {/* Confirmar senha */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={eyeButtonStyle()}>
                {showConfirm ? <EyeOff size={20} color="#aaaaaa" /> : <Eye size={20} color="#aaaaaa" />}
              </button>
            </div>

            {message && (
              <p style={{ color: isError ? '#ef4444' : '#D4AF37', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                {message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', background: '#D4AF37', color: '#000000', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '…' : 'GUARDAR NOVA SENHA'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
