# XZK — Backend (Supabase) do motor de análise

Motor que analisa o clip **de verdade** (frame a frame + áudio) com **Gemini
native video**, pontua os 6 pilares (LEGENDA, HEADLINE, FALA, MÚSICA, EFEITOS,
FINAL) com evidência (timestamp) e ancora tudo na curva de retenção real.
Gating por plano é decidido **no servidor** a partir de `profiles.plan`.

## Peças
- `migrations/0001_init.sql` — enums, `profiles`, `analyses`, `trending_audios`,
  `resources`, `clip_tracking` e a função `record_analysis()` (limites por plano).
- `migrations/0002_rls_and_storage.sql` — RLS + buckets privados `clip-videos`
  (≤100MB, ≤90s) e `clip-metrics` (≤10MB), escopados por `auth.uid()`.
- `migrations/0003_seed_curated.sql` — exemplos de áudios/recursos por nicho
  (troque pelos reais).
- `functions/analyze-clip/` — Edge Function (verify_jwt) com o pipeline.
- `functions/_shared/` — rubrica (guardrail de domínio), cliente Gemini,
  normalizador/validador de JSON, gating por plano.

## Planos e limites (em `record_analysis()`)
| plano   | limite                |
|---------|-----------------------|
| free    | 1 análise (vitalícia) |
| starter | 5 análises / dia      |
| pro     | ilimitado             |
| elite   | ilimitado + extras    |

## Deploy
```bash
# 1. linkar o projeto
supabase link --project-ref SEU_REF

# 2. aplicar schema + RLS + buckets + seed
supabase db push

# 3. segredo do motor de IA (o resto é injetado pelo runtime)
#    Usa o SDK oficial @google/genai → aceita auth keys atuais (prefixo AQ.)
supabase secrets set GEMINI_API_KEY=AQ.xxxxx
# opcional: supabase secrets set GEMINI_MODEL=gemini-2.5-flash

# 4. deploy da função
supabase functions deploy analyze-clip
```
No frontend (Vercel), defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Gating por plano (servidor → `_shared/gating.ts`)
Os 6 pilares + evidência + retenção + veredito + gargalo entram em TODOS. Variam:
- `edit_plan` (roteiro de edição) → **elite**.
- `estrategias_crescimento` → free, pro, elite (não starter).
- `correcoes_prioritarias` → starter: até 3; demais: completas.
- `audios_sugeridos`/`fontes`/`tutoriais` → starter: 1 de cada; demais: completos.
- comparativo semanal → elite (frontend lê `clip_tracking`).
O client só renderiza o que sobrar do gating.

## Honestidade (sem "99,9%")
Com print de métricas → diagnóstico ancorado nas quedas reais de retenção,
`confidence: "alta"`. Sem métricas → "Viral Readiness Score" com confiança
explícita (`média`/`baixa`). Nunca "garantido".

## Custo / segurança
- `record_analysis()` roda **antes** da IA: se `limit_reached`, retorna 429 sem
  gastar. Plano sempre do banco; o trigger `guard_plan_change` impede o usuário
  de subir o próprio plano (só `service_role`/webhook do Stripe pode).
- Buckets privados, download via service_role na função. Chave do Gemini é
  secret do Supabase, nunca no client. Retry de JSON limitado a 1.

## Stripe (depois)
Ao conectar o checkout, o webhook (service_role) atualiza `profiles.plan`. O
gating já lê de lá — nada mais muda no motor.
