// Edge Function: send-welcome-email  (verify_jwt = false — called right after signUp)
// Sends a branded welcome email via Resend.
// Secret required: RESEND_API_KEY (set in Supabase Edge Function secrets)
import { corsHeaders, json } from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM = 'ClipAnalisis <noreply@clipanalisis.com>';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return json({ ok: false, error: 'email_not_configured' }, 500);
  }

  let email: string;
  try {
    const body = await req.json();
    email = body.email as string;
    if (!email || !email.includes('@')) throw new Error('invalid email');
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Inter',Arial,sans-serif;color:#F0F0FF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#12121A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a26,#0f0f1a);padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.04em;color:#D4AF37;">
              CLIP<span style="color:#F0F0FF;">ANALISIS</span>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F0F0FF;line-height:1.3;">
              Bem-vindo ao ClipAnalisis 🎬
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:rgba(240,240,255,0.65);line-height:1.6;">
              A tua conta está activa. Podes começar a analisar os teus clips agora mesmo — sem precisar de confirmar nada.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#D4AF37;border-radius:8px;">
                  <a href="https://clipanalisis.com" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#0A0A0F;text-decoration:none;letter-spacing:0.05em;">
                    ANALISAR O MEU CLIP →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Plan info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:10px;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#D4AF37;letter-spacing:0.12em;text-transform:uppercase;">Plano Gratuito</p>
                  <p style="margin:0;font-size:14px;color:rgba(240,240,255,0.7);line-height:1.5;">
                    1 análise por dia · Reset às 00h00 UTC<br>
                    Quer mais análises? <a href="https://clipanalisis.com/#planos" style="color:#D4AF37;text-decoration:none;font-weight:600;">Vê os planos →</a>
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:rgba(240,240,255,0.4);line-height:1.6;">
              Se não criaste esta conta, podes ignorar este email.<br>
              — Equipa ClipAnalisis
            </p>
          </td>
        </tr>

        <!-- Footer -->
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
</html>
`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: 'Bem-vindo ao ClipAnalisis 🎬',
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return json({ ok: false, error: 'resend_error', detail: err }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    console.error('send-welcome-email error:', err);
    return json({ ok: false, error: 'send_failed' }, 500);
  }
});
