import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseReady } from '@/lib/supabase';
import type { PlanTier } from '@/lib/analysis-types';

export interface AuthState {
  session: Session | null;
  plan: PlanTier;
  fullName: string | null;
  /** true for free users (no sub needed); true for paid users with active/trialing sub */
  subscriptionActive: boolean;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [plan, setPlan] = useState<PlanTier>('free');
  const [fullName, setFullName] = useState<string | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return; }
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
      setFullName(null);
      setSubscriptionActive(true);
      return;
    }

    const userId = session.user.id;

    // 1. Fetch plan + full_name from profiles
    supabase
      .from('profiles')
      .select('plan, full_name')
      .eq('id', userId)
      .single()
      .then(async ({ data }) => {
        const userPlan = (data?.plan as PlanTier) ?? 'free';
        setPlan(userPlan);
        setFullName((data?.full_name as string | null) ?? null);

        // 2. For paid plans, verify the subscription is still active in Stripe
        if (userPlan === 'free') {
          setSubscriptionActive(true);
          return;
        }
        try {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing'])
            .limit(1)
            .maybeSingle();
          // If no active subscription row found, treat as free
          setSubscriptionActive(sub !== null);
        } catch {
          // If subscriptions table doesn't exist yet, assume active
          setSubscriptionActive(true);
        }
      });
  }, [session]);

  return { session, plan, fullName, subscriptionActive, loading };
}
