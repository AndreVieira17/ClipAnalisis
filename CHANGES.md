# CHANGES — ClipAnalisis Refactor

## O que foi alterado e porquê

### Arquitectura
- **Adicionado `react-router-dom` v7** — a app era uma landing page de secção única sem rotas. Agora tem URLs próprios para cada página.
- **`App.tsx` refactored** — era o componente de landing; agora é o router principal com rotas públicas (`/`, `/auth`) e rotas autenticadas (`/app/*`).
- **`src/pages/Landing.tsx`** — o conteúdo da landing foi movido para aqui, mantendo toda a lógica e design existente (ouro/preto, 3D, motion) **intactos**.

### Novas páginas (secção autenticada `/app/*`)
| Rota | Ficheiro | Descrição |
|---|---|---|
| `/auth` | `src/pages/Auth.tsx` | Login e registo com validação e feedback de erro |
| `/app/dashboard` | `src/pages/Dashboard.tsx` | Stats, análises recentes, acesso rápido |
| `/app/upload` | `src/pages/Upload.tsx` | Stepper 3 passos: upload (drag-and-drop) → configurar → analisar |
| `/app/library` | `src/pages/Library.tsx` | Histórico completo com pesquisa, filtros e ordenação |
| `/app/settings` | `src/pages/Settings.tsx` | Conta, plano, uso, logout |
| `/app/analysis/:id` | `src/pages/AnalysisView.tsx` | Resultado de uma análise com polling automático |

### Novos componentes UI (`src/components/ui/`)
- **`Button.tsx`** — variantes primary/secondary/ghost/danger, estado loading com spinner
- **`Card.tsx`** — variantes solid/glass, suporte a onClick
- **`Badge.tsx`** — badges de status (pending/processing/done/error) com cores semânticas
- **`ProgressBar.tsx`** — barra animada, variantes accent/success/warning
- **`EmptyState.tsx`** — estado vazio genérico com ícone, título, descrição e CTA
- **`Skeleton.tsx`** — skeletons de loading para cards e listas
- **`Toaster.tsx`** — sistema de notificações toast (sucesso/erro/aviso/info)

### Novo layout de app (`src/components/layout/`)
- **`AppLayout.tsx`** — sidebar colapsável (64px / 220px), bottom nav mobile, toast context
- **`AuthLayout.tsx`** — layout centrado para páginas de auth
- **`ErrorBoundary.tsx`** — boundary global que apanha erros e mostra página amigável

### Novos hooks e types
- **`src/hooks/useAnalyses.ts`** — lista, actualiza e elimina análises via Supabase
- **`src/hooks/useToast.ts`** — sistema de toasts efémeros
- **`src/components/auth/AuthGuard.tsx`** — protege rotas autenticadas, redireciona para `/auth`
- **`src/types/index.ts`** — tipos TypeScript centralizados (Analysis, UserProfile, Toast, etc.)
- **`src/lib/utils.ts`** — formatBytes, formatDuration, formatDate, formatRelativeTime, cn

### Design system expandido
- **`src/styles/tokens.css`** — adicionados tokens para a secção app: violet accent (`--app-accent: #7C3AED`), bg-primary/secondary/card, borders, semantic colors, sidebar widths
- **`tailwind.config.ts`** — novas cores `app.*` e fontes `grotesk`/`inter`
- **`index.html`** — adicionadas fontes Space Grotesk e Inter (para a secção app)

### Deploy
- **`vercel.json`** — adicionado rewrite `/((?!assets/).*) → /index.html` para SPA routing funcionar na Vercel

### Edge Function e SQL
**Não foram alterados.** A Edge Function `analyze-clip` e as migrações SQL estão intactas.

---

## Decisões de design

1. **Dois design systems em coexistência** — a landing mantém o design ouro/preto/Anton (marca forte existente). A secção `/app` usa violet dark com Space Grotesk/Inter (SaaS profissional). Não há conflito porque os tokens têm prefixo `--app-`.

2. **`ResultView` reutilizado** — o componente existente que mostra pilares, curva de retenção e correções é excelente e foi reutilizado dentro da `AnalysisView` page em vez de ser reescrito.

3. **Sem alterações ao schema SQL** — o schema existente (tabela `analyses`) mapeia directamente para os tipos UI. Não foi necessário adicionar migrações.

4. **Code splitting por página** — cada página app (`Dashboard`, `Upload`, `Library`, etc.) é um chunk separado carregado sob demanda. O Three.js (1MB) continua lazy-loaded apenas para o hero da landing.

---

## Como correr localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar ficheiro de variáveis de ambiente
cp .env.example .env.local
# Preencher com as chaves do Supabase (ver secção abaixo)

# 3. Correr em desenvolvimento
npm run dev
# → http://localhost:5173

# 4. Verificar tipos
npm run typecheck

# 5. Build de produção
npm run build
npm run preview  # para testar o build localmente
```

---

## Variáveis de ambiente necessárias

### `.env.local`
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Function (painel Supabase → Edge Functions → Secrets)
```
GEMINI_API_KEY=AIza...
```

### Vercel (painel Vercel → Project → Environment Variables)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

> A `GEMINI_API_KEY` NUNCA vai no frontend — só nos secrets da Edge Function.
