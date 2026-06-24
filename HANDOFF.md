# XZK — Guia de Entrega / Deploy completo

Tudo que é preciso para colocar o site **XZK** no ar do zero: frontend na
**Vercel** + backend no **Supabase** + IA do **Gemini**. Siga na ordem.

> Visão técnica detalhada do projeto está em [`LOVABLE_SPEC.md`](./LOVABLE_SPEC.md)
> e [`supabase/README.md`](./supabase/README.md). Este guia é só o passo a passo
> de deploy.

---

## 0. O que você vai precisar (contas)

| Serviço | Para quê | Custo |
|---------|----------|-------|
| **GitHub** | guardar o código | grátis |
| **Vercel** | hospedar o site (frontend) | grátis (Hobby) |
| **Supabase** | banco, login, storage, função de IA | grátis (free tier) |
| **Google AI Studio** | chave do Gemini (a IA que analisa) | paga por uso (centavos/análise) |

Instale também no computador:
- **Node.js 18+** → https://nodejs.org
- **Supabase CLI** → `npm install -g supabase`
- **Git** → https://git-scm.com

---

## 1. Pegar o código

```bash
git clone https://github.com/gagintylty-bot/clipanalises.git
cd clipanalises
npm install
```

Testar localmente (opcional, sem backend ainda funciona o visual):
```bash
npm run dev      # abre http://localhost:5173
```

---

## 2. Criar o projeto no Supabase

1. Acesse https://supabase.com → **New Project**.
2. Dê um nome, escolha uma senha forte para o banco (anote) e uma região.
3. Espere provisionar (~2 min).
4. Anote o **Project Ref** (o ID na URL: `supabase.com/dashboard/project/SEU_REF`).

### 2.1 Aplicar banco + segurança + storage (CLI)

```bash
# logar no CLI (abre o navegador)
supabase login

# linkar o projeto (usa o Project Ref do passo 4)
supabase link --project-ref SEU_REF

# aplicar todo o schema: tabelas, RLS, buckets, seed
supabase db push
```

### 2.2 Configurar a chave do Gemini

1. Acesse https://aistudio.google.com → **Get API key** → **Create API key**.
2. Copie a chave.
3. No terminal:
```bash
supabase secrets set GEMINI_API_KEY=SUA_CHAVE_DO_GEMINI
# opcional: trocar o modelo
# supabase secrets set GEMINI_MODEL=gemini-2.5-flash
```

### 2.3 Subir a função de IA

```bash
supabase functions deploy analyze-clip
```
> O aviso "Docker is not running" é normal e não atrapalha.

### 2.4 Pegar as chaves do frontend

No painel do Supabase → **Settings → API Keys**:
- **Project URL** → `https://SEU_REF.supabase.co`
- **anon public** → a chave `eyJ...` (essa é segura no navegador)

Guarde as duas para o passo 4.

---

## 3. Subir o código no seu GitHub (se for outra conta)

Se o seu amigo vai usar a conta dele:
```bash
# criar um repositório novo no GitHub dele primeiro, depois:
git remote set-url origin https://github.com/CONTA_DELE/REPO_DELE.git
git push -u origin main
```
> Se for manter este repositório, pode pular este passo.

---

## 4. Deploy na Vercel

1. Acesse https://vercel.com → **Add New → Project**.
2. **Import** o repositório do GitHub.
3. A Vercel detecta **Vite** automaticamente (não precisa mudar build settings —
   já existe um `vercel.json` no projeto).
4. Antes de fazer deploy, abra **Environment Variables** e adicione as duas:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://SEU_REF.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | a chave `anon public` (eyJ...) |

5. Clique **Deploy** e aguarde ficar verde.

> Se mudar as variáveis depois, é preciso **Redeploy** (Deployments → ... →
> Redeploy) — o Vite embute as variáveis no momento do build.

---

## 5. Configurar o e-mail de login (Supabase Auth)

O login é por **e-mail/senha**. No painel do Supabase:
1. **Authentication → Providers → Email**: deixe habilitado.
2. **Authentication → URL Configuration**: em **Site URL**, coloque a URL da
   Vercel (ex.: `https://seu-projeto.vercel.app`) para os links de confirmação
   apontarem certo.
3. (Opcional) Para testes rápidos, em **Authentication → Providers → Email**,
   pode desativar "Confirm email" para não precisar confirmar cada cadastro.

---

## 6. Teste final (checklist)

- [ ] Abrir a URL da Vercel — a landing carrega (ouro/preto/branco).
- [ ] Clicar em **COMEÇAR GRÁTIS** — abre o analisador.
- [ ] Criar uma conta (e-mail/senha).
- [ ] Subir um clip de até 90s + (opcional) print das métricas.
- [ ] Esperar 1–3 min — o resultado aparece (score + 6 pilares + correções).
- [ ] Fazer uma 2ª análise no plano free — deve mostrar **"LIMITE DO PLANO"**.

Se aparecer **"BACKEND NÃO CONFIGURADO"**: as variáveis na Vercel não entraram —
confira nomes/valores e faça **Redeploy**.

---

## 7. Como funcionam os planos (gating)

| Plano | Limite | Como muda |
|-------|--------|-----------|
| free | 1 análise vitalícia | — |
| starter | 5 análises/dia | |
| pro | ilimitado | |
| elite | ilimitado + extras | |

- O plano é lido **sempre do banco** (`profiles.plan`); o usuário **não** pode
  subir o próprio plano (trava por trigger).
- Para mudar o plano de alguém **manualmente** (enquanto o Stripe não está
  ligado): Supabase → **Table Editor → profiles** → edite a coluna `plan` do
  usuário (`free`/`starter`/`pro`/`elite`). Como é via painel (service_role), a
  trava permite.
- Para **resetar** o limite de um usuário em teste: **Table Editor → analyses** →
  apague as linhas dele (ou mude o `status` para `error`).

---

## 8. Custos (importante)

- **Gemini** é o único custo real por uso: cada análise manda o vídeo inteiro pro
  `gemini-2.5-flash` (cobra por segundo de vídeo + tokens). Um clip de ~60s custa
  centavos. Acompanhe em https://aistudio.google.com/usage.
- A função `record_analysis()` roda **antes** da IA: se o usuário passou do
  limite, retorna sem gastar Gemini.
- **Supabase** e **Vercel**: free tier cobre bem o começo.

---

## 9. Próximo passo: Stripe (pagamento — ainda não ligado)

O motor já lê o plano de `profiles.plan`. Para cobrar de verdade:
1. Criar produtos/preços no Stripe (starter/pro/elite).
2. Criar um webhook (com `service_role`) que, ao confirmar pagamento, atualiza
   `profiles.plan` do usuário.
3. Nada mais muda no motor — o gating já respeita o plano.

---

## 10. Comandos úteis

```bash
npm run dev        # rodar local
npm run build      # gerar build de produção (dist/)
npm run preview    # servir o build local
npm run typecheck  # checar tipos
npm run lint       # checar lint

# backend
supabase db push                         # aplicar migrações
supabase functions deploy analyze-clip   # atualizar a função de IA
supabase secrets set GEMINI_API_KEY=...  # trocar a chave do Gemini
```

---

## 11. Estrutura do projeto (mapa rápido)

```
src/
  App.tsx                      # monta as seções
  content.ts                   # TODA a copy do site (textos, planos, FAQ)
  index.css / styles/tokens.css# design system (ouro/preto/branco)
  components/
    sections/                  # Header, Hero, HowItWorks, Analyzed, Plans, Social, Faq, FinalCta, Footer
    analyze/                   # o app de análise (modal, upload, resultado, auth)
    three/                     # objeto 3D do hero (opcional, lazy)
    ui/                        # PopCard, Reveal, Foil, Stat, BrandMark
  hooks/                       # useAuth, usePointer3D, useCountUp...
  lib/                         # supabase.ts, analyze.ts (fluxo), analysis-types.ts
supabase/
  migrations/                  # schema, RLS, buckets, seed (SQL)
  functions/analyze-clip/      # Edge Function (pipeline da IA)
  functions/_shared/           # rubrica, cliente Gemini, validação, gating
public/brand/                  # logo/favicon (placeholders — troque pelos reais)
vercel.json                    # config de deploy da Vercel
.env.example                   # modelo das variáveis
```

---

## 12. Trocar a marca (logo)

Os arquivos em `public/brand/` são **placeholders** (monograma "XZK" dourado).
Troque por SVGs reais:
- `xzk-symbol.svg` — símbolo principal
- `favicon.svg` — ícone da aba
- `og-image.svg` — imagem de compartilhamento

E calibre os tons de ouro em `src/styles/tokens.css` se quiser.
