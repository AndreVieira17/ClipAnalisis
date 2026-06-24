// Edge Function: create-checkout  (verify_jwt = true)
// Creates a Stripe Checkout session in EUR for a given plan.
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const APP_URL = Deno.env.get('APP_URL') ?? 'https://clipanalisis.com';

// Stripe Price IDs must be created in the Stripe dashboard in EUR and set here
// via Supabase Edge Function Secrets.
const PRICE_IDS: Record<string, string> = {
  starter: Deno.env.get('STRIPE_PRICE_STARTER') ?? '',
  pro:     Deno.env.get('STRIPE_PRICE_PRO') ?? '',
  elite:   Deno.env.get('STRIPE_PRICE_ELITE') ?? '',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  try {
    // ---- 1. Auth -----------------------------------------------------------
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ ok: false, error: 'unauthorized' }, 401);

    const userId = userData.user.id;
    const email = userData.user.email ?? '';

    // ---- 2. Input ----------------------------------------------------------
    const { plan } = await req.json();
    if (!plan || !PRICE_IDS[plan]) {
      return json({ ok: false, error: 'invalid_plan' }, 400);
    }
    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return json({ ok: false, error: 'price_not_configured', plan }, 500);
    }

    // ---- 3. Create Stripe session ------------------------------------------
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      currency: 'eur',
      success_url: `${APP_URL}/app/settings?checkout=success&plan=${plan}`,
      cancel_url: `${APP_URL}/#planos`,
      metadata: { user_id: userId, plan },
      subscription_data: { metadata: { user_id: userId, plan } },
    });

    return json({ ok: true, url: session.url });
  } catch (err) {
    console.error('create-checkout error', err);
    return json({ ok: false, error: 'checkout_failed' }, 500);
  }
});
