# XZK — Raio-X de Viralização pra Clip

App premium (ouro · preto · branco) que analisa clips **frame a frame + áudio**
com IA (Gemini), pontua 6 pilares com evidência por timestamp, ancora na curva de
retenção real e devolve correções. Landing + app de análise, com planos
(free/starter/pro/elite) e gating decidido no servidor.

**Marca:** XZK · **Stack:** Vite + React + TypeScript + Tailwind · Supabase ·
Gemini · deploy na **Vercel**.

---

## 📦 Documentos deste repositório (comece aqui)

| Arquivo | Para quê |
|---------|----------|
| **[HANDOFF.md](./HANDOFF.md)** | **👉 Passo a passo de deploy do zero** (Vercel + Supabase + Gemini). É por aqui que se começa. |
| [LOVABLE_SPEC.md](./LOVABLE_SPEC.md) | Especificação técnica completa do site (design, seções, copy, backend, JSON). |
| [supabase/README.md](./supabase/README.md) | Detalhes do motor de análise (backend). |

---

## ⚡ Subir rápido (resumo)

```bash
# 1. código
git clone <repo> && cd clipanalises && npm install

# 2. backend (Supabase)
supabase login
supabase link --project-ref SEU_REF
supabase db push
supabase secrets set GEMINI_API_KEY=SUA_CHAVE_DO_GEMINI
supabase functions deploy analyze-clip

# 3. frontend (Vercel) — importe o repo e defina as env vars:
#    VITE_SUPABASE_URL=https://SEU_REF.supabase.co
#    VITE_SUPABASE_ANON_KEY=<anon public>
```

> O passo a passo detalhado (com prints do que fazer em cada painel) está no
> **[HANDOFF.md](./HANDOFF.md)**.

---

## 🧩 O que cada um precisa ter (contas próprias)

- **Supabase** (banco/login/storage/função) — free tier.
- **Google AI Studio** (chave do Gemini) — paga por uso, centavos por análise.
- **Vercel** (hospedagem) — free tier.

⚠️ Cada pessoa usa **a própria chave do Gemini** — senão o custo cai na conta de
quem cedeu a chave.

---

## 🗂️ Estrutura

```
src/
  App.tsx                       # monta as seções
  content.ts                    # TODA a copy do site (textos, planos, FAQ)
  index.css, styles/tokens.css  # design system (ouro/preto/branco)
  components/
    sections/                   # Header, Hero, HowItWorks, Analyzed, Plans, Social, Faq, FinalCta, Footer
    analyze/                    # app de análise (modal, upload, resultado, auth)
    three/                      # objeto 3D do hero (lazy, opcional)
    ui/                         # PopCard, Reveal, Foil, Stat, BrandMark
  hooks/                        # useAuth, usePointer3D, useCountUp...
  lib/                          # supabase.ts, analyze.ts, analysis-types.ts
supabase/
  migrations/                   # schema, RLS, buckets, seed (SQL)
  functions/analyze-clip/       # Edge Function (pipeline da IA)
  functions/_shared/            # rubrica, cliente Gemini, validação, gating
public/brand/                   # logo/favicon (placeholders — troque pelos reais)
vercel.json                     # config de deploy
.env.example                    # modelo das variáveis
```

---

## 🛠️ Comandos

```bash
npm run dev        # rodar local (http://localhost:5173)
npm run build      # build de produção (dist/)
npm run preview    # servir o build local
npm run typecheck  # checar tipos
npm run lint       # checar lint

supabase db push                         # aplicar migrações
supabase functions deploy analyze-clip   # atualizar a função de IA
supabase secrets set GEMINI_API_KEY=...  # trocar a chave do Gemini
```

---

## 💳 Stripe (pagamento — ainda não ligado)

O motor já lê o plano de `profiles.plan`. Para cobrar: criar produtos no Stripe +
um webhook (service_role) que atualiza `profiles.plan` ao confirmar pagamento.
Nada mais muda no motor. Enquanto isso, dá pra mudar o plano de um usuário
manualmente no Supabase → Table Editor → `profiles`.

---

## 🎨 Trocar a marca

`public/brand/` tem placeholders dourados (`xzk-symbol.svg`, `favicon.svg`,
`og-image.svg`). Troque pelos assets reais e calibre os tons em
`src/styles/tokens.css`.
