# XZK — Raio-X de Viralização para Clips · Especificação completa (Lovable)

Cole este documento no Lovable como prompt-base. Ele descreve **todo o site**:
design system, seções, copy, o fluxo do analisador e o backend (Supabase +
Gemini). Construa exatamente como descrito.

---

## 1. Visão geral

Landing page premium + app de análise de clips para criadores que querem
viralizar (TikTok / Reels / Shorts). O usuário sobe um vídeo curto (≤90s) + um
print das métricas; uma IA (Gemini) analisa **frame a frame + áudio**, pontua 6
pilares com evidência por timestamp, ancora na curva de retenção real e devolve
um diagnóstico com correções. Gating por plano (free/starter/pro/elite) decidido
**no servidor**.

**Marca:** XZK. **Idioma:** Português do Brasil, voz de "clipador" — curta,
direta, CAPS onde cabe.

---

## 2. Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS
- **Animação:** Framer Motion (reveals, stagger, hover, ticker, count-up)
- **3D (opcional):** React Three Fiber + drei — um objeto dourado no hero,
  lazy-loaded com fallback estático em mobile fraco / reduced-motion
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions em Deno)
- **IA:** Google Gemini (`gemini-2.5-flash`) via SDK oficial `@google/genai`,
  usando native video (Files API)
- **Deploy:** Vercel (frontend) + Supabase (backend)

---

## 3. Design system (OURO · PRETO · BRANCO)

Ouro tratado como **metal** (highlight + sombra), nunca amarelo chapado. Preto
dominante, branco cirúrgico. Grão sutil, hairlines douradas, scanlines discretas,
glow contido. Tudo respeita `prefers-reduced-motion` e só anima `transform`/`opacity`.

### Tokens (CSS variables)
```css
--bg: #0a0a0b;          /* preto-quase, nunca #000 puro */
--bg-elev: #121214;
--surface: #1a1a1d;
--text: #f5f3ec;        /* off-white quente */
--white: #ffffff;       /* contraste cirúrgico / brilhos */
--muted: #8f8b80;       /* cinza quente */
--border: rgba(212,175,55,0.18);  /* hairline dourada */
--gold: #d4af37;        /* ouro sólido — accent, bordas, glow */
--gold-hi: #f6e08a;     /* brilho do metal */
--gold-lo: #8c6e22;     /* sombra do metal */
--danger: #e5484d;      /* funcional, RARO */
--foil: linear-gradient(180deg,#f6e08a 0%,#e6c35c 24%,#d4af37 52%,#b8932e 78%,#8c6e22 100%);
```

### Fontes
- **Anton** — display / títulos (uppercase, tight)
- **Montserrat** — corpo
- **JetBrains Mono** — números, métricas, chips, timestamps

### Utilitários visuais
- `.gold-foil` — texto com gradiente metálico `--foil` (background-clip:text)
- `.btn-gold` — botão com fundo `--foil`, texto preto, sombra dourada
- `.btn-ghost` — transparente, borda hairline, hover dourado
- `.chip` — pílula mono uppercase, borda hairline
- `.num-glow` — text-shadow dourado para números grandes
- `.grain` — ruído fractal global em overlay (opacity ~0.045)
- `.scanlines` — linhas horizontais sutis em overlay
- raio de borda padrão `rounded-xzk` (~14px)

---

## 4. Estrutura da página (ordem das seções)

```
<Header />              (fixo)
<main>
  <Hero />
  <HowItWorks />
  <Analyzed />
  <Plans />
  <Social />
  <Faq />
  <FinalCta />
</main>
<Footer />
<AnalyzerModal />       (overlay fullscreen, controlado por contexto)
```

Todos os CTAs ("COMEÇAR GRÁTIS", "FAZER O RAIO-X", "VIRAR PRO", etc.) abrem o
**AnalyzerModal**. Um Context (`AnalyzerProvider` com `isOpen`, `open`, `close`)
controla o modal.

### 4.1 Header
- Fixo no topo, fundo translúcido com blur. Monograma XZK à esquerda (com leve
  efeito glitch), ticker horizontal dos "killers" (lista abaixo) rolando, e CTA
  dourado "FAZER O RAIO-X" à direita.

### 4.2 Hero
- Headline foil enorme: **"TEU CLIP NÃO ESTOURA? A GENTE ACHA O QUE MATA."**
- Subcopy: o que prende e o que MATA, frame a frame.
- 2 CTAs: "COMEÇAR GRÁTIS" (gold) e "VER PLANOS" (ghost).
- Stats com count-up (ex.: "+212% retenção", "6 pilares", "frame a frame").
- Objeto 3D dourado (clip/phone) que inclina rumo ao ponteiro e avança em Z ao
  segurar. Lazy-loaded; fallback estático. Vídeo ambiente em loop com poster.

### 4.3 HowItWorks — 3 passos
```
01 · MANDA O VÍDEO + O PRINT — Sobe o clip e o print das métricas (retenção, views, gráfico). Quanto mais cru, melhor o raio-X.
02 · A XZK FAZ O RAIO-X — A IA cruza edição, ritmo, áudio e gancho com o que de fato segura a audiência. Frame a frame.
03 · VOCÊ REEDITA E ESTOURA — Recebe o que prende, o que MATA e o corte exato pra refazer. Aplica e reposta pra viralizar.
```

### 4.4 Analyzed — o que a IA analisa (grid de 6 cards)
```
GANCHO   · OS 3 PRIMEIROS SEGUNDOS — Se não dá soco no primeiro segundo, o resto não importa. A gente mede onde o dedo quer rolar.
RITMO    · CADÊNCIA DE CORTE — Corte lento mata clip. Mapeamos o ritmo ideal pro teu formato e onde ele afrouxa.
RETENÇÃO · CURVA DE ABANDONO — Cruzamos teu print com a edição pra achar o frame exato em que o povo some.
ÁUDIO    · PUNCH & MIXAGEM — Áudio estourado ou mole derruba alcance. Checamos punch, clareza e o drop certo.
LEGENDA  · TIMING DA LEGENDA — Palavra a palavra, no tempo certo, com a keyword no ouro. Legenda é metade do clip.
CTA      · GANCHO DE LOOP — O corte que liga o fim no começo e segura o replay. É o que multiplica view.
```

### 4.5 Plans — 4 planos (Pro e Elite com destaque/aura)
```
FREE     · R$0    · 1 análise   · "Um raio-X completo pra você ver o nível. Sem cartão."
  - 1 análise (vitalícia)
  - 6 pilares frame a frame + evidência
  - Diagnóstico de retenção
  - Veredito + gargalo
  - Estratégias de crescimento
  CTA: COMEÇAR GRÁTIS

STARTER  · R$64   · /mês        · "Pra começar a postar com direção todo dia."
  - 5 análises / dia
  - 6 pilares + evidência + retenção
  - Veredito + gargalo
  - Até 3 correções prioritárias
  - 1 áudio / fonte / tutorial
  CTA: ASSINAR STARTER

PRO ★    · R$160  · /mês        · "Pro clipador que vive de postar e quer estourar."
  - Análises ILIMITADAS
  - Correções prioritárias completas
  - Estratégias de crescimento
  - Áudios / fontes / tutoriais completos
  - Prioridade na fila
  CTA: VIRAR PRO

ELITE ★  · R$224  · /mês        · "Pra quem vive disso. Tudo do Pro com roteiro de edição."
  - Tudo do Pro, ilimitado
  - Roteiro de edição com timestamps
  - Comparativo semanal de evolução
  - Prioridade máxima na fila
  - Benchmark com virais do nicho
  CTA: ENTRAR NO ELITE
```

### 4.6 Social — depoimentos
```
"Reeditei seguindo o raio-X e o corte bateu 1.2M. Nunca tinha passado de 40k." — @cortesdozeh · Clipador
"Achou em 2 min o que eu não via há meses: meu gancho começava 3s tarde." — @viralou.br · Editor
"O comparativo entre clips é cirúrgico. Hoje eu sei por que um estoura e o outro morre." — @filipecuts · Streamer
```

### 4.7 FAQ
```
PRECISO MANDAR O PRINT MESMO? — O print das métricas é o que deixa o raio-X cirúrgico. Sem ele a gente analisa só a edição; com ele, cruzamos com a retenção real.
FUNCIONA PRA QUALQUER NICHO? — Sim. Humor, gameplay, reação, podcast, lifestyle. A IA calibra o ritmo ideal pro teu formato.
É SÓ CLIP DE STREAM? — Não. Qualquer vídeo curto vertical — Reels, Shorts, TikTok. O mecanismo é o mesmo: o que prende e o que mata.
MEUS VÍDEOS FICAM GUARDADOS? — Só o tempo da análise. Você controla e pode apagar quando quiser. Nada vira conteúdo de terceiros.
QUANTO TEMPO DEMORA? — O raio-X sai em poucos minutos. No Elite, fila prioritária deixa quase instantâneo.
```

### 4.8 FinalCta + Footer
- CTA final foil grande "FAZ O RAIO-X DO TEU CLIP" + botão.
- Footer minimal: monograma XZK, links, copyright.

### Killers (ticker no Header)
```
CORTE LENTO MATA · GANCHO FRACO = SCROLL · LEGENDA SEM RITMO · CLÍMAX NO LUGAR ERRADO ·
ÁUDIO ESTOURADO · PRIMEIRO SEG. SEM SOCO · CTA INEXISTENTE · THUMB SEM CARA
```

---

## 5. Analisador (AnalyzerModal) — fluxo

Overlay fullscreen, fundo **sólido preto** (sem textura sobre o texto, para
leitura limpa). Barra superior: chip "RAIO-X XZK", indicador de plano, botão sair,
botão fechar. Passos (state machine):

1. **auth** — se não logado, tela de login (email/senha via Supabase Auth).
2. **upload** — formulário:
   - Campo vídeo (MP4/MOV/WEBM · ≤90s · ≤100MB) — valida tipo, tamanho e duração
     no cliente (lendo `<video>.duration`).
   - Campo print das métricas (PNG/JPG/WEBP · ≤10MB, opcional).
   - Seletor de plataforma: TikTok / Reels / Shorts.
   - Campo nicho/tema (texto livre).
   - **Antes do upload**, checa a quota do plano (ver §7). Se já bateu o limite,
     mostra direto a tela de limite.
3. **processing** — tela "ANALISANDO TEU CLIP" com animação de scan (1–3 min).
4. **result** — ver §6.
5. **limit** — "LIMITE DO PLANO" + copy por plano + botão "VER PLANOS".
6. **error** — "DEU RUIM" + botão "TENTAR DE NOVO".

---

## 6. Tela de resultado (ResultView)

Renderiza o JSON da IA (ver §8). Componentes:
- **Viral Readiness Score** grande (0–100) em foil + selo de confiança
  (alta/média/baixa) + veredito em 1 frase.
- **6 medidores de pilar** (headline, legenda, fala, música, efeitos, final) com
  número count-up e barra animada; o **gargalo** destacado em vermelho.
- **Curva de retenção** (SVG) com pontos de queda marcados (quando há print).
- **Evidência frame a frame** — accordion por pilar, cada item `timestamp + observação`.
- **Correções prioritárias** — lista numerada (título / o que fazer / por quê).
- **Roteiro de edição** (só elite) — timeline com timestamps.
- **Estratégias de crescimento** — bullets.
- **Chips** clicáveis: áudios sugeridos, fontes, tutoriais.

Cores de score: ≥75 ouro `#D4AF37` · ≥50 `#E6C35C` · ≥30 `#C9893E` · resto vermelho `#E5484D`.

---

## 7. Planos e limites (gating — SEMPRE no servidor)

| plano   | limite                | extras                                             |
|---------|-----------------------|----------------------------------------------------|
| free    | 1 análise (vitalícia) | sem edit_plan; sem starter-only                    |
| starter | 5 análises / dia      | até 3 correções; 1 áudio/fonte/tutorial            |
| pro     | ilimitado             | tudo completo                                      |
| elite   | ilimitado + extras    | + roteiro de edição + comparativo semanal + benchmark |

- O plano vem **sempre do banco** (`profiles.plan`), nunca do cliente.
- Função `record_analysis()` roda **antes** da IA: se passou do limite, retorna
  429 sem gastar Gemini.
- O cliente também espelha a checagem (conta análises `processing|done`) só para
  mostrar a tela de limite antes do upload — mas o servidor é a trava real.
- Um trigger impede o usuário de subir o próprio plano (só `service_role`/webhook
  do Stripe pode).

---

## 8. Backend — Supabase

### 8.1 Schema (Postgres)
```sql
-- enums
plan_tier:        'free' | 'starter' | 'pro' | 'elite'
analysis_status:  'pending' | 'processing' | 'done' | 'error'

-- profiles (1 por usuário; plan = fonte da verdade do gating)
profiles(id uuid pk -> auth.users, email text, plan plan_tier default 'free', created_at)
  -> trigger handle_new_user(): cria profile (plan=free) a cada novo auth user

-- analyses
analyses(
  id uuid pk, user_id uuid -> auth.users, plan plan_tier,
  platform text, niche text,
  video_path text, metrics_image_path text,    -- caminhos no storage
  ai_result jsonb,                              -- saída validada da IA
  error_message text,
  status analysis_status default 'pending', created_at
)

-- curados (read: authenticated; write: service_role)
trending_audios(id, niche, platform, title, artist, url, active, created_at)
resources(id, topic, kind['tutorial'|'fonte'|'template'], title, url, niche, active, created_at)

-- evolução
clip_tracking(id, user_id, analysis_id, score int, views bigint, retention numeric, niche, recorded_at)
```

### 8.2 record_analysis(p_analysis_id) — única trava de limite
```
- resolve user_id da análise
- lê plan do profiles (default free)
- free:    conta analyses do user (status in processing|done) -> limite 1 vitalício
- starter: conta do dia (created_at >= início do dia) -> limite 5
- pro/elite: ilimitado
- se estourou -> { ok:false, error:'limit_reached', plan }
- senão -> { ok:true, plan, remaining }
SECURITY DEFINER; grant execute para authenticated, service_role.
```

### 8.3 RLS + Storage
- RLS em todas as tabelas: dono lê/escreve só o que é `auth.uid()`.
- Trigger `guard_plan_change`: bloqueia o usuário de alterar o próprio `plan`
  (só service_role).
- Buckets privados: `clip-videos` (≤100MB, mimes mp4/mov/webm) e `clip-metrics`
  (≤10MB, png/jpg/webp). Política: primeiro segmento do path = `auth.uid()`.
  Convenção de path: `${user_id}/${analysis_id}/${filename}`.

### 8.4 Edge Function `analyze-clip` (verify_jwt = true)
Pipeline:
```
1. Auth: valida JWT, pega userId.
2. Lê a linha analyses pelo analysis_id (precisa ser do user).
3. Gate: chama record_analysis() — se limit_reached, 429 SEM rodar IA.
4. Marca status 'processing'.
5. Busca dados curados do nicho (trending_audios, resources).
6. Baixa mídia do storage (service_role).
7. Roda Gemini native video (vídeo + print + prompt). 1 retry com temp maior se
   o JSON vier inválido.
8. Valida/normaliza o JSON; aplica gating por plano (corta campos premium).
9. Persiste ai_result + status 'done'; insere clip_tracking.
10. Retorna { ok:true, result }.
Em erro: status 'error' + mensagem; 500.
```

### 8.5 Motor de IA (Gemini)
- SDK `@google/genai`, modelo `gemini-2.5-flash` (override por `GEMINI_MODEL`).
- Upload do vídeo via Files API; aguarda ficar ACTIVE; `generateContent` sobre
  vídeo + imagem de métricas (inline base64) + prompt; `responseMimeType:
  'application/json'`, `temperature` 0.4 (retry 0.6), `maxOutputTokens` 8192.
- **Rubrica/guardrail de domínio** no systemInstruction: só análise de clip;
  6 pilares com evidência por timestamp; ancorar na retenção real quando houver
  print; **honestidade** — com métricas: confiança "alta"; sem: "Viral Readiness
  Score" com confiança explícita (média/baixa); nunca "99,9% garantido".

### 8.6 Formato do ai_result (JSON)
```ts
{
  niche: string,
  has_metrics: boolean,
  viral_readiness: number,            // 0-100
  confidence: 'alta'|'média'|'baixa',
  retention: { drops: [{ ts, from, to, causa_provavel }] },
  pilares: {                          // 6 chaves abaixo
    headline|legenda|fala|musica|efeitos|final: {
      score: number, evidencia: [{ ts, obs }], fix: string
    }
  },
  gargalo: 'headline'|'legenda'|'fala'|'musica'|'efeitos'|'final',
  veredicto: string,
  correcoes_prioritarias: [{ titulo, oquefazer, porque }],
  estrategias_crescimento?: string[],
  audios_sugeridos: [{ title, url, motivo }],
  fontes: [{ title, url }],
  tutoriais: [{ title, url }],
  edit_plan?: [{ ts_inicio, ts_fim, acao, detalhe }]   // só elite
}
```

---

## 9. Variáveis de ambiente

**Frontend (Vite — público, só anon):**
```
VITE_SUPABASE_URL=https://SEU-REF.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**Edge Function (secrets do Supabase):**
```
GEMINI_API_KEY=...           # SDK aceita auth keys (AQ.) e legadas (AIza)
GEMINI_MODEL=gemini-2.5-flash   # opcional
# SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetados pelo runtime
```

---

## 10. Próximo passo (Stripe — pendente)
Conectar checkout. O webhook (service_role) atualiza `profiles.plan`; o gating já
lê de lá — nada mais muda no motor.

---

## 11. Performance / acessibilidade
- JS inicial enxuto; `three`/R3F em chunk separado, carregado só quando o 3D monta.
- supabase-js fora do paint inicial (analisador lazy-loaded).
- Vídeo `preload="none"` + poster, pausado fora da viewport.
- Fontes com subset + `display=swap`.
- Tudo respeita `prefers-reduced-motion`; anima só `transform`/`opacity`.
