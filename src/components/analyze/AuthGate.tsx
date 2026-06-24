import { useState } from 'react';
import { supabase } from '@/lib/supabase';

/** Minimal email+password auth. A profile (plan=free) is created by a DB trigger. */
export function AuthGate() {
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        setMsg('Conta criada! Se pedir confirmação, confira teu e-mail.');
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
        <input
          type="password"
          required
          minLength={6}
          placeholder="senha (mín. 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xzk border border-border bg-bg px-4 py-3 text-text outline-none focus:border-gold/50"
        />
        <button type="submit" disabled={busy} className="btn-gold w-full rounded-xzk px-5 py-3 disabled:opacity-60">
          {busy ? '...' : mode === 'up' ? 'CRIAR CONTA' : 'ENTRAR'}
        </button>
      </form>
      {msg && <p className="mt-3 text-center text-sm text-gold">{msg}</p>}
      <button
        onClick={() => setMode(mode === 'up' ? 'in' : 'up')}
        className="mt-4 w-full text-center text-sm text-muted hover:text-gold-hi"
      >
        {mode === 'up' ? 'Já tenho conta — entrar' : 'Criar conta nova'}
      </button>
    </div>
  );
}
