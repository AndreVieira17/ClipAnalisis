// Edge Function: stripe-webhook  (verify_jwt = false — Stripe signs the payload)
// Listens for Stripe events and keeps the Supabase `profiles.plan` + `subscriptions` in sync.
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

type PlanTier = 'free' | 'starter' | 'pro' | 'elite';

// Map Stripe Price IDs back to plan tiers
const PRICE_TO_PLAN: Record<string, PlanTier> = {
  [Deno.env.get('STRIPE_PRICE_STARTER') ?? '__starter__']: 'starter',
  [Deno.env.get('STRIPE_PRICE_PRO')     ?? '__pro__']:     'pro',
  [Deno.env.get('STRIPE_PRICE_ELITE')   ?? '__elite__']:   'elite',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // ---- 1. Verify Stripe signature ----------------------------------------
  const signature = req.headers.get('stripe-signature') ?? '';
  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('stripe-webhook signature verification failed', err);
    return json({ ok: false, error: 'invalid_signature' }, 400);
  }

  // ---- 2. Handle events --------------------------------------------------
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(admin, stripe, session);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(admin, sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(admin, sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(admin, invoice);
        break;
      }
      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error(`stripe-webhook handler error for ${event.type}`, err);
    return json({ ok: false, error: 'handler_error' }, 500);
  }

  return json({ ok: true, type: event.type });
});

// ---- Handlers --------------------------------------------------------------

async function handleCheckoutCompleted(
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.user_id;
  const plan = (session.metadata?.plan ?? 'free') as PlanTier;
  if (!userId) return;

  const subscriptionId = session.subscription as string | null;

  // Upgrade the user's plan
  await admin.from('profiles').update({ plan }).eq('id', userId);

  // Upsert subscription record
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price.id ?? '';
    await admin.from('subscriptions').upsert({
      id: subscriptionId,
      user_id: userId,
      plan,
      price_id: priceId,
      stripe_customer_id: session.customer as string,
      status: sub.status,
      current_period_start: new Date((sub.current_period_start ?? 0) * 1000).toISOString(),
      current_period_end: new Date((sub.current_period_end ?? 0) * 1000).toISOString(),
    }, { onConflict: 'id' });
  }
}

async function handleSubscriptionChange(
  admin: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
) {
  const userId = sub.metadata?.user_id;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price.id ?? '';
  const plan: PlanTier = PRICE_TO_PLAN[priceId] ?? 'free';

  await admin.from('profiles').update({ plan }).eq('id', userId);
  await admin.from('subscriptions').upsert({
    id: sub.id,
    user_id: userId,
    plan,
    price_id: priceId,
    stripe_customer_id: sub.customer as string,
    status: sub.status,
    current_period_start: new Date((sub.current_period_start ?? 0) * 1000).toISOString(),
    current_period_end: new Date((sub.current_period_end ?? 0) * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
  }, { onConflict: 'id' });
}

async function handleSubscriptionDeleted(
  admin: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
) {
  const userId = sub.metadata?.user_id;
  if (!userId) return;

  // Downgrade to free on cancellation
  await admin.from('profiles').update({ plan: 'free' }).eq('id', userId);
  await admin.from('subscriptions').update({ status: 'canceled' }).eq('id', sub.id);
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
) {
  const subId = invoice.subscription as string | null;
  if (!subId) return;
  await admin.from('subscriptions').update({ status: 'past_due' }).eq('id', subId);
}
