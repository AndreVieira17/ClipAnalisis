import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseReady } from '@/lib/supabase';
import type { PlanTier } from '@/lib/analysis-types';

export interface AuthState {
  session: Session | null;
  plan: PlanTier;
  loading: boolean;
}

/** Session + the user's plan (read from the DB, never assumed). */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [plan, setPlan] = useState<PlanTier>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabaseReady || !session?.user) {
      setPlan('free');
      return;
    }
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setPlan((data?.plan as PlanTier) ?? 'free'));
  }, [session]);

  return { session, plan, loading };
}
