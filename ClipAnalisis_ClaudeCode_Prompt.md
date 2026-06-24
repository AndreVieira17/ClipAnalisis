# 🎬 ClipAnalisis — Prompt para Claude Code
## Refactor completo + UI profissional

---

## CONTEXTO DO PROJECTO

Tens um projecto existente chamado **ClipAnalisis**: uma plataforma SaaS de análise de clips de vídeo usando a API do Gemini (Google AI Studio). O stack actual é:

- **Frontend**: React + TypeScript + Tailwind CSS (gerado via Lovable)
- **Backend**: Supabase (base de dados + auth + storage)
- **IA**: Edge Function no Supabase que chama a API do Gemini
- **Deploy**: Vercel

O projecto já funciona mas precisa de um **refactor de qualidade profissional** e uma **UI nova, moderna e distintiva** — nada genérico.

---

## OBJECTIVO

Fazer um refactor completo do código existente e redesenhar a UI para um produto SaaS profissional de análise de vídeo com IA. O resultado final deve parecer um produto como **Descript**, **Wistia** ou **Mux** — não um projecto universitário.

---

## FASE 1 — AUDITORIA DO PROJECTO EXISTENTE

Antes de fazer qualquer alteração, faz uma auditoria completa:

```bash
# Percorre toda a estrutura do projecto
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | grep -v node_modules | grep -v dist | sort

# Lê o package.json
cat package.json

# Lê o README e HANDOFF
cat README.md
cat HANDOFF.md 2>/dev/null || echo "sem HANDOFF"

# Lista os ficheiros de migração SQL
ls supabase/migrations/ 2>/dev/null || echo "sem migrações"

# Lê a Edge Function
cat supabase/functions/*/index.ts 2>/dev/null
```

Depois de ler tudo, escreve um relatório resumido com:
- Estrutura de pastas actual
- Componentes existentes e o que fazem
- Problemas de código identificados (repetição, má organização, falta de tipos, etc.)
- Problemas de UX/UI identificados

---

## FASE 2 — REFACTOR DE CÓDIGO

### 2.1 Estrutura de pastas

Reorganiza para esta estrutura clara:

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Input, Badge, etc.)
│   ├── layout/          # Header, Sidebar, Footer, PageWrapper
│   ├── clips/           # ClipUploader, ClipCard, ClipGrid, ClipViewer
│   ├── analysis/        # AnalysisPanel, AnalysisResult, InsightCard
│   └── auth/            # LoginForm, SignupForm, AuthGuard
├── pages/
│   ├── Landing.tsx      # Página pública de marketing
│   ├── Dashboard.tsx    # Dashboard principal autenticado
│   ├── Upload.tsx       # Upload e análise de clips
│   ├── Library.tsx      # Biblioteca de clips analisados
│   ├── Settings.tsx     # Definições de conta e API key
│   └── Auth.tsx         # Login / Registo
├── hooks/
│   ├── useClips.ts      # CRUD de clips via Supabase
│   ├── useAnalysis.ts   # Chamadas à Edge Function do Gemini
│   ├── useAuth.ts       # Auth state do Supabase
│   └── useUpload.ts     # Upload de ficheiros para Supabase Storage
├── lib/
│   ├── supabase.ts      # Cliente Supabase
│   ├── gemini.ts        # Helper para chamar a Edge Function
│   └── utils.ts         # Funções utilitárias (formatBytes, formatDuration, etc.)
├── types/
│   └── index.ts         # Tipos TypeScript globais (Clip, Analysis, User, etc.)
└── styles/
    └── globals.css      # Variáveis CSS + reset
```

### 2.2 Tipos TypeScript

Define tipos claros em `src/types/index.ts`:

```typescript
export interface Clip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  mime_type: string;
  status: 'uploading' | 'ready' | 'analysing' | 'analysed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  clip_id: string;
  user_id: string;
  summary: string;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  key_moments: KeyMoment[];
  transcript?: string;
  action_items?: string[];
  raw_response?: object;
  created_at: string;
}

export interface KeyMoment {
  timestamp_seconds: number;
  label: string;
  description: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'team';
  clips_used: number;
  clips_limit: number;
  created_at: string;
}
```

### 2.3 Qualidade de código

- Remove todo o código comentado e consolas de debug
- Substitui qualquer `any` por tipos correctos
- Extrai lógica repetida para hooks ou utils
- Garante que TODOS os componentes têm props tipadas com interfaces TypeScript
- Adiciona `loading`, `error` e `empty` states a todas as listagens
- Usa `React.memo` onde faz sentido para performance

---

## FASE 3 — UI NOVA (Design System Profissional)

### 3.1 Identidade visual

**Paleta de cores** (dark-first, profissional):
```css
:root {
  /* Base */
  --bg-primary: #0A0A0F;
  --bg-secondary: #12121A;
  --bg-card: #1A1A26;
  --bg-hover: #22223A;
  
  /* Bordas */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.12);
  --border-strong: rgba(255,255,255,0.24);
  
  /* Acento — violeta eléctrico */
  --accent: #7C3AED;
  --accent-hover: #6D28D9;
  --accent-glow: rgba(124, 58, 237, 0.3);
  --accent-subtle: rgba(124, 58, 237, 0.12);
  
  /* Texto */
  --text-primary: #F0F0FF;
  --text-secondary: rgba(240,240,255,0.6);
  --text-muted: rgba(240,240,255,0.35);
  
  /* Semânticas */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Raios e sombras */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 40px var(--accent-glow);
}
```

**Tipografia**:
- Display: `Space Grotesk` (peso 600-700, para títulos e headings)
- Body: `Inter` (peso 400-500, para corpo de texto)
- Mono: `JetBrains Mono` (para timestamps, código, métricas)

Adiciona ao `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.2 Componentes UI base

Cria (ou refaz) estes componentes em `src/components/ui/`:

**Button.tsx** — variantes: `primary`, `secondary`, `ghost`, `danger`. Sempre com estado `loading` (spinner inline).

**Card.tsx** — com variante `glass` (backdrop-blur + border subtil) e `solid`.

**Badge.tsx** — para status dos clips: `uploading`, `analysing`, `analysed`, `error`.

**ProgressBar.tsx** — para upload e progresso de análise. Animado.

**EmptyState.tsx** — componente genérico com ícone, título, descrição e CTA opcional.

**Skeleton.tsx** — loading skeletons para cards e listas.

### 3.3 Layout principal (autenticado)

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (64px colapsada / 220px expandida)      │
│  ┌──────────────────────────────────────────────┐│
│  │  Logo ClipAnalisis                                    ││
│  │  ─────────────────                           ││
│  │  [≡] Dashboard                               ││
│  │  [⬆] Upload                                  ││
│  │  [▤] Library                                 ││
│  │  [⚙] Settings                                ││
│  │  ─────────────────                           ││
│  │  [Plano: FREE 3/10 clips]  ← usage indicator ││
│  │  [Avatar] Nome do utilizador                 ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  MAIN CONTENT (fluid)                            │
│  ┌──────────────────────────────────────────────┐│
│  │  Page Header (título + breadcrumb + actions) ││
│  │  ──────────────────────────────────────────  ││
│  │  [Conteúdo da página]                        ││
│  └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 3.4 Página de Dashboard

Mostra:
- **Stats bar**: Total de clips, Clips analisados, Tempo de vídeo total, Créditos restantes
- **Clips recentes**: Grid 3 colunas com ClipCards (thumbnail + título + status + data)
- **Actividade recente**: Lista das últimas análises com badge de sentimento

### 3.5 Página de Upload

Fluxo em 3 passos com stepper visual:
1. **Upload** — drag-and-drop zone grande, aceita MP4/MOV/WebM/MKV, mostra preview + progress bar
2. **Configurar** — título, descrição, opções de análise (transcrição, resumo, momentos-chave, action items)
3. **Analisar** — botão grande "Analisar com Gemini", mostra animação de progresso em tempo real

### 3.6 ClipCard

```
┌─────────────────────────────┐
│  [Thumbnail / Preview]       │
│  ──────────────────────────  │
│  Título do clip              │
│  2m 34s  •  12.4 MB          │
│  ─────────────────────────── │
│  [● Analisado]   [Ver →]     │
└─────────────────────────────┘
```

Hover: aparece botão de play overlay no thumbnail.

### 3.7 Página de Análise (resultado)

Layout duas colunas:
- **Esquerda**: Player de vídeo + timeline de momentos-chave clicáveis
- **Direita**: Tabs com Resumo / Transcrição / Momentos-chave / Action Items

Badge de sentimento com cor: verde (positivo), amarelo (neutro/misto), vermelho (negativo).

### 3.8 Landing Page (pública)

Secções por ordem:
1. **Hero**: Headline impactante + subheadline + CTA "Começar grátis" + demo animado (mockup do dashboard)
2. **Social proof**: "Trusted by X teams" + logos fictícios ou reais
3. **Como funciona**: 3 passos (Upload → IA analisa → Insights instantâneos)
4. **Features**: Grid 2x3 com os diferenciais da plataforma
5. **Pricing**: 3 planos (Free / Pro / Team) com tabela de comparação
6. **CTA final**: Chamada à acção + botão de registo
7. **Footer**: Links + copyright

---

## FASE 4 — FUNCIONALIDADES A GARANTIR

Verifica e corrige se necessário:

### Auth
- [ ] Login com email/password via Supabase Auth
- [ ] Registo com confirmação de email
- [ ] Redirecionamento após auth
- [ ] Protected routes (qualquer página autenticada redireciona para login se não houver sessão)
- [ ] Logout limpa estado

### Upload
- [ ] Drag-and-drop funcional
- [ ] Validação de tipo de ficheiro (só vídeo)
- [ ] Validação de tamanho máximo (configurável, ex: 500MB)
- [ ] Upload para Supabase Storage com progresso real
- [ ] Preview do vídeo antes de enviar
- [ ] Feedback de erro claro se o upload falhar

### Análise com Gemini
- [ ] Chama a Edge Function do Supabase após upload
- [ ] Mostra estado "A analisar..." com animação
- [ ] Trata erros da API (rate limit, timeout, etc.)
- [ ] Guarda resultado na base de dados
- [ ] Actualiza estado do clip para "analysed"

### Library
- [ ] Listagem paginada (ou infinite scroll) de clips do utilizador
- [ ] Filtro por status (todos / analisados / a analisar / erro)
- [ ] Pesquisa por título
- [ ] Ordenação por data / duração / tamanho
- [ ] Opção de eliminar clip (com confirmação)

### Settings
- [ ] Editar nome de utilizador
- [ ] Ver plano actual e uso (clips usados / limite)
- [ ] Mostrar/esconder API key do Gemini (se configurável por utilizador)

---

## FASE 5 — QUALIDADE TÉCNICA

### Performance
- Lazy loading de imagens e thumbnails
- Code splitting por página (React.lazy + Suspense)
- Compressão de thumbnails antes de guardar no storage

### Acessibilidade
- Todos os botões têm `aria-label` quando só têm ícones
- Foco visível em todos os elementos interactivos
- Contraste mínimo WCAG AA em todos os textos

### Responsividade
- Mobile: sidebar vira bottom nav de 4 botões
- Tablet: sidebar colapsada por defeito
- Desktop: sidebar expandida

### Error handling
- Boundary de erro global que mostra página de erro amigável
- Toast notifications para feedback de acções (upload concluído, análise pronta, erro, etc.)
- Loading skeletons em vez de spinners genéricos

---

## FASE 6 — VERIFICAÇÃO FINAL

Antes de terminar, verifica:

```bash
# Build sem erros
npm run build

# Sem erros de TypeScript
npx tsc --noEmit

# Sem warnings de ESLint críticos
npx eslint src/ --ext .ts,.tsx
```

Cria um ficheiro `CHANGES.md` na raiz que documenta:
- O que foi alterado e porquê
- Decisões de design tomadas
- Como correr o projecto localmente
- Variáveis de ambiente necessárias

---

## INSTRUÇÕES FINAIS PARA O CLAUDE CODE

1. **Começa sempre pela auditoria** (Fase 1) — não toques em código sem perceber o que existe.
2. **Faz as alterações de forma incremental** — não refaz tudo de uma vez. Começa pela estrutura, depois os tipos, depois os componentes, depois as páginas.
3. **Testa após cada fase** — corre `npm run dev` e verifica que não partiste nada.
4. **Mantém a lógica de negócio existente** — não alteres a Edge Function do Gemini nem as migrações SQL a menos que encontres um bug real.
5. **Se algo não existir**, cria-o do zero seguindo as especificações acima.
6. **Prioridade de trabalho**: Funcionar correctamente > Ter bom design > Ter código limpo. Nesta ordem.

---

---

## VARIÁVEIS DE AMBIENTE

### Ficheiro `.env.local` (raiz do projecto)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe (pagamentos — opcional se não tiveres planos pagos ainda)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

> ⚠️ A `GEMINI_API_KEY` **não vai aqui** — vai nos Secrets da Edge Function do Supabase (ver abaixo).

### Supabase — Edge Function Secret

No painel do Supabase: *Edge Functions → Manage secrets → New secret*

```
GEMINI_API_KEY=AIza...
```

### Vercel — Environment Variables

No painel da Vercel: *Project → Settings → Environment Variables*

Adiciona as mesmas variáveis do `.env.local`:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY   ← se tiveres Stripe
STRIPE_SECRET_KEY             ← se tiveres Stripe
```

### Onde obter cada chave

| Serviço | Onde ir |
|---------|---------|
| Supabase | supabase.com → Project Settings → API |
| Gemini | aistudio.google.com → Get API Key |
| Stripe | dashboard.stripe.com → Developers → API Keys |
| Vercel | Login com GitHub — não precisa de chave manual |
| GitHub | Credenciais git normais — não precisa de chave manual |

### Verifica que o `.gitignore` tem estas linhas

```
.env
.env.local
.env*.local
```

Nunca faças commit de chaves para o GitHub.

---

*Gerado para o projecto ClipAnalisis — Plataforma SaaS de análise de clips com Gemini*
