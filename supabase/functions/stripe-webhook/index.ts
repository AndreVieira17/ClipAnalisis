// Edge Function: stripe-webhook  (verify_jwt = false — Stripe signs the payload)
// Listens for Stripe events and keeps profiles.plan + subscriptions in sync.
// Sets subscription_start_date / subscription_end_date (+30 days) on every payment.
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE          = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY     = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const RESEND_API_KEY        = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL            = 'ClipAnalisis <noreply@clipanalisis.com>';
const TELEGRAM_LINK         = Deno.env.get('TELEGRAM_ELITE_LINK') ?? 'https://t.me/clipanalisis_elite';;

type PlanTier = 'free' | 'starter' | 'pro' | 'elite';

const PRICE_TO_PLAN: Record<string, PlanTier> = {
  [Deno.env.get('STRIPE_PRICE_STARTER') ?? '__starter__']: 'starter',
  [Deno.env.get('STRIPE_PRICE_PRO')     ?? '__pro__']:     'pro',
  [Deno.env.get('STRIPE_PRICE_ELITE')   ?? '__elite__']:   'elite',
};

/** +30 days from now as ISO string */
function thirtyDaysFromNow(from = new Date()): string {
  return new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  const admin  = createClient(SUPABASE_URL, SERVICE_ROLE);

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
      case 'invoice.payment_succeeded': {
        // Renewal: extend the 30-day window
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(admin, invoice);
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
  const plan   = (session.metadata?.plan ?? 'free') as PlanTier;
  if (!userId) return;

  const now           = new Date();
  const endDate       = thirtyDaysFromNow(now);
  const subscriptionId = session.subscription as string | null;

  // Upgrade profiles.plan
  await admin.from('profiles').update({ plan }).eq('id', userId);

  if (subscriptionId) {
    const sub     = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price.id ?? '';

    await admin.from('subscriptions').upsert({
      id:                     subscriptionId,
      user_id:                userId,
      plan,
      price_id:               priceId,
      stripe_customer_id:     session.customer as string,
      status:                 sub.status,
      current_period_start:   new Date((sub.current_period_start ?? 0) * 1000).toISOString(),
      current_period_end:     new Date((sub.current_period_end   ?? 0) * 1000).toISOString(),
      subscription_start_date: now.toISOString(),
      subscription_end_date:  endDate,
      daily_analyses_used:    0,
      last_daily_reset:       now.toISOString(),
    }, { onConflict: 'id' });
  }

  // Send Telegram invite email for Elite plan
  if (plan === 'elite' && session.customer_email) {
    await sendEliteEmail(session.customer_email).catch((e) =>
      console.error('send-elite-email failed (non-fatal):', e)
    );
  }
}

async function sendEliteEmail(email: string): Promise<void> {
  if (!RESEND_API_KEY) return;

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Inter',Arial,sans-serif;color:#F0F0FF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#12121A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a26,#0f0f1a);padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.04em;color:#D4AF37;">
              CLIP<span style="color:#F0F0FF;">ANALISIS</span>
              <span style="font-size:12px;font-weight:600;margin-left:10px;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.4);border-radius:20px;padding:3px 10px;color:#D4AF37;letter-spacing:0.1em;">ELITE</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F0F0FF;line-height:1.3;">
              Bem-vindo ao Elite 👑
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:rgba(240,240,255,0.65);line-height:1.6;">
              O teu plano Elite está activo. Como membro Elite tens acesso ao nosso grupo privado no Telegram — onde partilhamos clips, estratégias e oportunidades antes de toda a gente.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#D4AF37;border-radius:8px;">
                  <a href="${TELEGRAM_LINK}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#0A0A0F;text-decoration:none;letter-spacing:0.05em;">
                    ENTRAR NO GRUPO TELEGRAM →
                  </a>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:10px;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#D4AF37;letter-spacing:0.12em;text-transform:uppercase;">O teu plano Elite inclui</p>
                  <ul style="margin:0;padding:0 0 0 16px;font-size:14px;color:rgba(240,240,255,0.7);line-height:1.8;">
                    <li>Análises ilimitadas</li>
                    <li>Revisão humana do clip</li>
                    <li>Roteiro de edição com timestamps</li>
                    <li>Prioridade máxima na fila</li>
                    <li>Benchmark com virais do nicho</li>
                    <li>Grupo privado no Telegram 💬</li>
                  </ul>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:rgba(240,240,255,0.4);line-height:1.6;">
              — Equipa ClipAnalisis
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(240,240,255,0.25);text-align:center;">
              © 2025 ClipAnalisis · Feito pra estourar
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: '👑 Bem-vindo ao Elite — o teu link do Telegram está aqui',
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

async function handleInvoicePaymentSucceeded(
  admin: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
) {
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) return;

  // Skip the initial invoice (checkout.session.completed already handles it)
  if (invoice.billing_reason === 'subscription_create') return;

  const now     = new Date();
  const endDate = thirtyDaysFromNow(now);

  await admin.from('subscriptions').update({
    status:                  'active',
    subscription_start_date: now.toISOString(),
    subscription_end_date:   endDate,
    daily_analyses_used:     0,
    last_daily_reset:        now.toISOString(),
  }).eq('id', subscriptionId);

  // Also ensure profiles.plan is still set correctly (in case it was downgraded)
  const { data: sub } = await admin
    .from('subscriptions')
    .select('user_id, plan')
    .eq('id', subscriptionId)
    .maybeSingle();

  if (sub?.user_id && sub?.plan) {
    await admin.from('profiles').update({ plan: sub.plan }).eq('id', sub.user_id);
  }
}

async function handleSubscriptionChange(
  admin: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
) {
  const userId  = sub.metadata?.user_id;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price.id ?? '';
  const plan: PlanTier = PRICE_TO_PLAN[priceId] ?? 'free';

  await admin.from('profiles').update({ plan }).eq('id', userId);
  await admin.from('subscriptions').upsert({
    id:                   sub.id,
    user_id:              userId,
    plan,
    price_id:             priceId,
    stripe_customer_id:   sub.customer as string,
    status:               sub.status,
    current_period_start: new Date((sub.current_period_start ?? 0) * 1000).toISOString(),
    current_period_end:   new Date((sub.current_period_end   ?? 0) * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
  }, { onConflict: 'id' });
}

async function handleSubscriptionDeleted(
  admin: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
) {
  const userId = sub.metadata?.user_id;
  if (!userId) return;

  const now = new Date().toISOString();

  // Downgrade to free
  await admin.from('profiles').update({ plan: 'free' }).eq('id', userId);
  await admin.from('subscriptions').update({
    status:               'canceled',
    subscription_end_date: now,
  }).eq('id', sub.id);
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
) {
  const subId = invoice.subscription as string | null;
  if (!subId) return;
  await admin.from('subscriptions').update({ status: 'past_due' }).eq('id', subId);
}
