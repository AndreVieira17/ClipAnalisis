import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'pt' | 'en' | 'es';

export interface PlanT {
  id: 'free' | 'starter' | 'pro' | 'elite';
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: 'pro' | 'elite';
}

export interface Translations {
  nav: {
    howItWorks: string; whatAnalyzed: string; plans: string; faq: string;
    analyzeClip: string; myClips: string; signOut: string; currentPlan: string;
  };
  hero: {
    chip: string; line1: string; line2: string; line3: string;
    subtitle: string; cta: string; ctaSecondary: string;
  };
  killers: string[];
  howItWorks: {
    chip: string; title: string; titleHighlight: string;
    steps: { step: string; title: string; body: string }[];
  };
  analyzed: {
    chip: string; title: string; titleHighlight: string;
    stats: { label: string }[];
    cards: { tag: string; title: string; body: string }[];
  };
  plans: {
    chip: string; title: string; titleHighlight: string; mostChosen: string;
    items: PlanT[];
  };
  social: {
    chip: string; title: string;
    testimonials: { quote: string; author: string; role: string }[];
  };
  faq: {
    chip: string; title: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    line1a: string; line1b: string; line2a: string; line2b: string;
    subtitle: string; cta: string;
  };
  footer: {
    description: string;
    links: { howItWorks: string; whatAnalyzed: string; plans: string; faq: string };
    copyright: string; tagline: string;
  };
  analysis: {
    viralReadiness: string; topics: string; topicsHint: string;
    corrections: string; strategies: string; actionPlan: string;
    editPlan: string; audios: string; sources: string; tutorials: string;
    scores: { excellent: string; good: string; decent: string; weak: string; critical: string };
    day: string; goal: string;
  };
  modal: {
    limitTitle: string; limitMsg: string; available: string;
    viewPlans: string; back: string;
    uploadingTitle: string; uploadingMsg: string;
    analyzingTitle: string; analyzingMsg: string;
    planLabel: string; signOut: string; close: string;
    notConfigured: string; analyzeAnother: string;
    limitPlanTitle: string; limitStarter: string; limitGeneric: string;
    tryAgain: string; errorTitle: string;
  };
  historico: {
    title: string; subtitle: string;
    noSessionTitle: string; noSessionMsg: string;
    statsTotal: string; statsAvg: string; statsBest: string;
    search: string; noResults: string; noClips: string;
    noResultsHint: string; noClipsHint: string;
    analyzeClip: string; viewAnalysis: string; goBack: string;
    analyses: (n: number) => string;
  };
  auth: {
    loginTitle: string; loginSubtitle: string;
    signupTitle: string; signupSubtitle: string;
    email: string; password: string;
    emailPlaceholder: string; passwordPlaceholder: string;
    loginBtn: string; signupBtn: string;
    noAccount: string; hasAccount: string;
    createAccount: string; signIn: string;
    successMsg: string;
  };
  signOutModal: {
    title: string; message: string; cancel: string; confirm: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTUGUÊS (master)
// ─────────────────────────────────────────────────────────────────────────────
const pt: Translations = {
  nav: {
    howItWorks: 'Como funciona', whatAnalyzed: 'O que é analisado',
    plans: 'Planos', faq: 'FAQ', analyzeClip: 'Analisar clip',
    myClips: 'Os meus clips', signOut: 'Sair', currentPlan: 'Plano actual',
  },
  hero: {
    chip: 'RAIO-X DE VIRALIZAÇÃO',
    line1: 'TEU CLIP NÃO', line2: 'ESTOURA?', line3: 'A GENTE ACHA O QUE MATA.',
    subtitle: 'Cola o link do TikTok, Reels ou Shorts — ou faz upload do vídeo. A ClipAnalisis faz o raio-X frame a frame: o que prende, o que mata e o corte exato pra reeditar e viralizar.',
    cta: 'Analisar meu clip', ctaSecondary: 'Ver como funciona',
  },
  killers: [
    'CORTE LENTO MATA', 'GANCHO FRACO = SCROLL', 'LEGENDA SEM RITMO',
    'CLÍMAX NO LUGAR ERRADO', 'ÁUDIO ESTOURADO', 'PRIMEIRO SEG. SEM SOCO', 'CTA INEXISTENTE', 'THUMB SEM CARA',
  ],
  howItWorks: {
    chip: 'O MECANISMO', title: 'Três passos pra parar de', titleHighlight: 'postar no escuro',
    steps: [
      { step: '01', title: 'MANDA O TEU CLIP', body: 'Faz upload do teu clip directamente. A IA analisa tudo frame a frame.' },
      { step: '02', title: 'A ClipAnalisis FAZ O RAIO-X', body: 'A IA cruza edição, ritmo, áudio e gancho com o que de fato segura a audiência. Frame a frame.' },
      { step: '03', title: 'VOCÊ REEDITA E ESTOURA', body: 'Recebe o que prende, o que MATA e o corte exato pra refazer. Aplica e reposta pra viralizar.' },
    ],
  },
  analyzed: {
    chip: 'O QUE É ANALISADO', title: 'Cada frame passa pelo', titleHighlight: 'raio-X',
    stats: [
      { label: 'retenção média' }, { label: 'pontos checados por clip' },
      { label: 'min pro raio-X sair' }, { label: 'maior virada' },
    ],
    cards: [
      { tag: 'GANCHO', title: 'OS 3 PRIMEIROS SEGUNDOS', body: 'Se não dá soco no primeiro segundo, o resto não importa. A gente mede onde o dedo quer rolar.' },
      { tag: 'RITMO', title: 'CADÊNCIA DE CORTE', body: 'Corte lento mata clip. Mapeamos o ritmo ideal pro teu formato e onde ele afrouxa.' },
      { tag: 'RETENÇÃO', title: 'CURVA DE ABANDONO', body: 'Cruzamos teu print com a edição pra achar o frame exato em que o povo some.' },
      { tag: 'ÁUDIO', title: 'PUNCH & MIXAGEM', body: 'Áudio estourado ou mole derruba alcance. Checamos punch, clareza e o drop certo.' },
      { tag: 'LEGENDA', title: 'TIMING DA LEGENDA', body: 'Palavra a palavra, no tempo certo, com a keyword no ouro. Legenda é metade do clip.' },
      { tag: 'CTA', title: 'GANCHO DE LOOP', body: 'O corte que liga o fim no começo e segura o replay. É o que multiplica view.' },
    ],
  },
  plans: {
    chip: 'PLANOS', title: 'Escolhe o teu', titleHighlight: 'nível', mostChosen: 'MAIS ESCOLHIDO',
    items: [
      { id: 'free', name: 'FREE', price: '0€', cadence: '', tagline: '1 análise grátis. Sem cartão.', features: ['1 análise grátis', '6 pilares frame a frame + evidência', 'Diagnóstico de retenção', 'Veredito + gargalo', 'Estratégias de crescimento'], cta: 'COMEÇAR GRÁTIS' },
      { id: 'starter', name: 'STARTER', price: '9.99€', cadence: '/mês', tagline: 'Pra começar a postar com direção todo mês.', features: ['10 análises / mês', '6 pilares + evidência + retenção', 'Veredito + gargalo', 'Até 3 correções prioritárias', '1 áudio / fonte / tutorial'], cta: 'ASSINAR STARTER' },
      { id: 'pro', name: 'PRO', price: '24.99€', cadence: '/mês', tagline: 'Pro clipador que vive de postar e quer estourar.', features: ['Análises ILIMITADAS', 'Correções prioritárias completas', 'Estratégias de crescimento', 'Áudios / fontes / tutoriais completos', 'Prioridade na fila'], cta: 'VIRAR PRO', highlight: 'pro' },
      { id: 'elite', name: 'ELITE', price: '39.99€', cadence: '/mês', tagline: 'Pra quem vive disso. Pro + revisão humana incluída.', features: ['Tudo do Pro, ilimitado', 'Revisão humana do clip', 'Roteiro de edição com timestamps', 'Prioridade máxima na fila', 'Benchmark com virais do nicho', 'Acesso ao grupo privado no Telegram 💬'], cta: 'ENTRAR NO ELITE', highlight: 'elite' },
    ],
  },
  social: {
    chip: 'QUEM JÁ REEDITOU', title: 'De 40k pra 1.2M',
    testimonials: [
      { quote: 'Reeditei seguindo o raio-X e o corte bateu 1.2M. Nunca tinha passado de 40k.', author: '@cortesdozeh', role: 'Clipador' },
      { quote: 'Achou em 2 min o que eu não via há meses: meu gancho começava 3s tarde.', author: '@viralou.br', role: 'Editor' },
      { quote: 'O comparativo entre clips é cirúrgico. Hoje eu sei por que um estoura e o outro morre.', author: '@filipecuts', role: 'Streamer' },
    ],
  },
  faq: {
    chip: 'DÚVIDAS', title: 'FAQ',
    items: [
      { q: 'O QUE PRECISO DE ENVIAR?', a: 'Faz upload do teu clip directamente na plataforma — não precisas de nenhum print ou screenshot. A IA analisa o vídeo frame a frame e devolve o raio-X completo.' },
      { q: 'FUNCIONA PRA QUALQUER NICHO?', a: 'Sim. Humor, gameplay, reação, podcast, lifestyle. A IA calibra o ritmo ideal pro teu formato.' },
      { q: 'É SÓ CLIP DE STREAM?', a: 'Não. Qualquer vídeo curto vertical — Reels, Shorts, TikTok. O mecanismo é o mesmo: o que prende e o que mata.' },
      { q: 'MEUS VÍDEOS FICAM GUARDADOS?', a: 'Só o tempo da análise. Você controla e pode apagar quando quiser. Nada vira conteúdo de terceiros.' },
      { q: 'QUANTO TEMPO DEMORA?', a: 'O raio-X sai em poucos minutos. No Elite, fila prioritária deixa quase instantâneo.' },
    ],
  },
  finalCta: {
    line1a: 'PARA DE', line1b: 'CHUTAR', line2a: 'COMEÇA A', line2b: 'ESTOURAR',
    subtitle: 'Manda o vídeo + o print agora. O primeiro raio-X é de graça.',
    cta: 'ANALISAR MEU CLIP GRÁTIS',
  },
  footer: {
    description: 'Raio-X de viralização pra clipador. Manda o teu clip, descobre o que o mata.',
    links: { howItWorks: 'Como funciona', whatAnalyzed: 'O que é analisado', plans: 'Planos', faq: 'FAQ' },
    copyright: 'Todos os direitos reservados', tagline: 'Feito pra estourar · BR',
  },
  analysis: {
    viralReadiness: 'VIRAL READINESS SCORE', topics: 'Análise dos 20 tópicos',
    topicsHint: 'Clica em cada tópico para ver o feedback e sugestões.',
    corrections: 'Correções prioritárias', strategies: 'Estratégias de crescimento',
    actionPlan: 'Plano de acção — 7 dias', editPlan: 'Roteiro de edição',
    audios: 'Áudios sugeridos', sources: 'Fontes', tutorials: 'Tutoriais',
    scores: { excellent: 'Muito Bom', good: 'Bom', decent: 'Médio', weak: 'Fraco', critical: 'Crítico' },
    day: 'DIA', goal: 'Meta',
  },
  modal: {
    limitTitle: 'LIMITE ATINGIDO',
    limitMsg: 'Já usaste a tua análise grátis. Faz upgrade para continuar sem limites.',
    available: 'Disponível agora!', viewPlans: 'VER PLANOS — ANALISAR SEM LIMITES', back: '← Voltar',
    uploadingTitle: 'A FAZER UPLOAD…', uploadingMsg: 'A enviar o vídeo para o servidor…',
    analyzingTitle: 'ANALISANDO O CLIP', analyzingMsg: 'Lendo frame a frame — fala, legenda, música, efeitos e final. Pode levar 1–3 min.',
    planLabel: 'plano:', signOut: 'sair', close: 'Fechar',
    notConfigured: 'BACKEND NÃO CONFIGURADO', analyzeAnother: 'ANALISAR OUTRO CLIP',
    limitPlanTitle: 'LIMITE DO PLANO', limitStarter: 'Atingiste o limite de 10 análises este mês. Faz upgrade para Pro.', limitGeneric: 'Limite atingido. Faz upgrade para continuar.',
    tryAgain: 'TENTAR DE NOVO', errorTitle: 'DEU RUIM',
  },
  historico: {
    title: 'OS MEUS CLIPS', subtitle: 'ANALISADOS',
    noSessionTitle: 'OS MEUS CLIPS', noSessionMsg: 'Faz login para acederes ao teu histórico de análises.',
    statsTotal: 'Total de clips', statsAvg: 'Score médio', statsBest: 'Melhor score',
    search: 'Pesquisar por plataforma ou nicho…', noResults: 'NENHUM RESULTADO', noClips: 'SEM CLIPS AINDA',
    noResultsHint: 'Tenta ajustar a pesquisa.', noClipsHint: 'Analisa o teu primeiro clip e recebe o raio-X de viralização.',
    analyzeClip: 'ANALISAR UM CLIP', viewAnalysis: 'VER ANÁLISE →', goBack: '← VOLTAR',
    analyses: (n) => `${n} ${n === 1 ? 'análise' : 'análises'}`,
  },
  auth: {
    loginTitle: 'Entrar na conta', loginSubtitle: 'Acede às tuas análises e histórico de clips.',
    signupTitle: 'Criar conta', signupSubtitle: 'Começa grátis — sem cartão de crédito.',
    email: 'Email', password: 'Password', emailPlaceholder: 'o.teu@email.com', passwordPlaceholder: 'mínimo 6 caracteres',
    loginBtn: 'Entrar', signupBtn: 'Criar conta', noAccount: 'Ainda não tens conta?', hasAccount: 'Já tens conta?',
    createAccount: 'Criar conta', signIn: 'Entrar',
    successMsg: 'Conta criada! Verifica o teu email para confirmar, depois entra.',
  },
  signOutModal: {
    title: 'Terminar sessão?', message: 'Tens a certeza que queres terminar a sessão?',
    cancel: 'Cancelar', confirm: 'Terminar sessão',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────
const en: Translations = {
  nav: {
    howItWorks: 'How it works', whatAnalyzed: 'What we analyze',
    plans: 'Plans', faq: 'FAQ', analyzeClip: 'Analyze clip',
    myClips: 'My clips', signOut: 'Sign out', currentPlan: 'Current plan',
  },
  hero: {
    chip: 'VIRALITY X-RAY',
    line1: 'YOUR CLIP NOT', line2: 'GOING VIRAL?', line3: 'WE FIND WHAT KILLS IT.',
    subtitle: 'Paste your TikTok, Reels or Shorts link — or upload the video. ClipAnalisis does a frame-by-frame X-ray: what hooks, what kills, and the exact cut to re-edit and go viral.',
    cta: 'Analyze my clip', ctaSecondary: 'See how it works',
  },
  killers: [
    'SLOW CUT KILLS', 'WEAK HOOK = SCROLL', 'CAPTION WITHOUT RHYTHM',
    'CLIMAX IN THE WRONG PLACE', 'BLOWN AUDIO', 'FIRST SEC. WITHOUT PUNCH', 'NO CTA', 'THUMB WITH NO FACE',
  ],
  howItWorks: {
    chip: 'THE MECHANISM', title: 'Three steps to stop', titleHighlight: 'posting in the dark',
    steps: [
      { step: '01', title: 'SEND YOUR CLIP', body: 'Upload your clip directly. The AI analyzes everything frame by frame.' },
      { step: '02', title: 'ClipAnalisis DOES THE X-RAY', body: 'The AI crosses editing, rhythm, audio and hook with what actually holds the audience. Frame by frame.' },
      { step: '03', title: 'YOU RE-EDIT AND GO VIRAL', body: 'Get what hooks, what KILLS and the exact cut to redo it. Apply and repost to go viral.' },
    ],
  },
  analyzed: {
    chip: 'WHAT IS ANALYZED', title: 'Every frame goes through the', titleHighlight: 'X-ray',
    stats: [
      { label: 'avg retention boost' }, { label: 'points checked per clip' },
      { label: 'min for the X-ray' }, { label: 'biggest turnaround' },
    ],
    cards: [
      { tag: 'HOOK', title: 'THE FIRST 3 SECONDS', body: "If it doesn't punch in the first second, the rest doesn't matter. We measure where the thumb wants to scroll." },
      { tag: 'RHYTHM', title: 'CUT CADENCE', body: 'Slow cut kills clips. We map the ideal rhythm for your format and where it slackens.' },
      { tag: 'RETENTION', title: 'DROP-OFF CURVE', body: 'We cross your screenshot with the edit to find the exact frame where people leave.' },
      { tag: 'AUDIO', title: 'PUNCH & MIXING', body: 'Blown or weak audio kills reach. We check punch, clarity and the right drop.' },
      { tag: 'CAPTION', title: 'CAPTION TIMING', body: 'Word by word, at the right time, with the keyword at the peak. Caption is half the clip.' },
      { tag: 'CTA', title: 'LOOP HOOK', body: 'The cut that connects the end to the beginning and holds the replay. That\'s what multiplies views.' },
    ],
  },
  plans: {
    chip: 'PLANS', title: 'Choose your', titleHighlight: 'clipper level', mostChosen: 'MOST POPULAR',
    items: [
      { id: 'free', name: 'FREE', price: '0€', cadence: '', tagline: '1 free analysis. No card.', features: ['1 free analysis', '6 pillars frame by frame + evidence', 'Retention diagnosis', 'Verdict + bottleneck', 'Growth strategies'], cta: 'START FOR FREE' },
      { id: 'starter', name: 'STARTER', price: '9.99€', cadence: '/mo', tagline: 'For those starting to post with direction every month.', features: ['10 analyses / month', '6 pillars + evidence + retention', 'Verdict + bottleneck', 'Up to 3 priority corrections', '1 audio / source / tutorial'], cta: 'GET STARTER' },
      { id: 'pro', name: 'PRO', price: '24.99€', cadence: '/mo', tagline: 'For the clipper who lives to post and wants to go viral.', features: ['UNLIMITED analyses', 'Complete priority corrections', 'Growth strategies', 'Full audios / sources / tutorials', 'Priority queue'], cta: 'GO PRO', highlight: 'pro' },
      { id: 'elite', name: 'ELITE', price: '39.99€', cadence: '/mo', tagline: 'For those who live off this. Pro + human review included.', features: ['Everything in Pro, unlimited', 'Human clip review', 'Editing script with timestamps', 'Maximum priority queue', 'Benchmark with niche virals', 'Access to private Telegram group 💬'], cta: 'JOIN ELITE', highlight: 'elite' },
    ],
  },
  social: {
    chip: 'WHO ALREADY RE-EDITED', title: 'From 40k to 1.2M',
    testimonials: [
      { quote: 'Re-edited following the X-ray and the cut hit 1.2M. Never passed 40k before.', author: '@cortesdozeh', role: 'Clipper' },
      { quote: 'Found in 2 min what I hadn\'t seen in months: my hook started 3s late.', author: '@viralou.br', role: 'Editor' },
      { quote: 'The clip comparison is surgical. Now I know why one goes viral and the other dies.', author: '@filipecuts', role: 'Streamer' },
    ],
  },
  faq: {
    chip: 'QUESTIONS', title: 'FAQ',
    items: [
      { q: 'WHAT DO I NEED TO SEND?', a: 'Just upload your clip directly on the platform — no screenshot or print needed. The AI analyzes the video frame by frame and returns the full X-ray.' },
      { q: 'DOES IT WORK FOR ANY NICHE?', a: 'Yes. Humor, gameplay, reaction, podcast, lifestyle. The AI calibrates the ideal rhythm for your format.' },
      { q: 'IS IT ONLY FOR STREAM CLIPS?', a: 'No. Any short vertical video — Reels, Shorts, TikTok. The mechanism is the same: what hooks and what kills.' },
      { q: 'ARE MY VIDEOS STORED?', a: "Only during the analysis. You control it and can delete whenever you want. Nothing becomes third-party content." },
      { q: 'HOW LONG DOES IT TAKE?', a: 'The X-ray is ready in a few minutes. On Elite, the priority queue makes it almost instant.' },
    ],
  },
  finalCta: {
    line1a: 'STOP', line1b: 'GUESSING', line2a: 'START', line2b: 'GOING VIRAL',
    subtitle: 'Send the video + the screenshot now. The first X-ray is free.',
    cta: 'ANALYZE MY CLIP FOR FREE',
  },
  footer: {
    description: 'Virality X-ray for clippers. Send your clip, discover what kills it.',
    links: { howItWorks: 'How it works', whatAnalyzed: 'What we analyze', plans: 'Plans', faq: 'FAQ' },
    copyright: 'All rights reserved', tagline: 'Built to go viral',
  },
  analysis: {
    viralReadiness: 'VIRAL READINESS SCORE', topics: 'Analysis of 20 topics',
    topicsHint: 'Click each topic to see feedback and suggestions.',
    corrections: 'Priority corrections', strategies: 'Growth strategies',
    actionPlan: '7-day action plan', editPlan: 'Editing script',
    audios: 'Suggested audios', sources: 'Sources', tutorials: 'Tutorials',
    scores: { excellent: 'Excellent', good: 'Good', decent: 'Average', weak: 'Weak', critical: 'Critical' },
    day: 'DAY', goal: 'Goal',
  },
  modal: {
    limitTitle: 'LIMIT REACHED',
    limitMsg: "You've used your free analysis. Upgrade to continue without limits.",
    available: 'Available now!', viewPlans: 'SEE PLANS — ANALYZE WITHOUT LIMITS', back: '← Back',
    uploadingTitle: 'UPLOADING…', uploadingMsg: 'Sending the video to the server…',
    analyzingTitle: 'ANALYZING CLIP', analyzingMsg: 'Reading frame by frame — speech, caption, music, effects and ending. May take 1–3 min.',
    planLabel: 'plan:', signOut: 'sign out', close: 'Close',
    notConfigured: 'BACKEND NOT CONFIGURED', analyzeAnother: 'ANALYZE ANOTHER CLIP',
    limitPlanTitle: 'PLAN LIMIT', limitStarter: "You've reached the 10 analysis limit this month. Upgrade to Pro.", limitGeneric: 'Limit reached. Upgrade to continue.',
    tryAgain: 'TRY AGAIN', errorTitle: 'SOMETHING WENT WRONG',
  },
  historico: {
    title: 'MY CLIPS', subtitle: 'ANALYZED',
    noSessionTitle: 'MY CLIPS', noSessionMsg: 'Sign in to access your analysis history.',
    statsTotal: 'Total clips', statsAvg: 'Avg score', statsBest: 'Best score',
    search: 'Search by platform or niche…', noResults: 'NO RESULTS', noClips: 'NO CLIPS YET',
    noResultsHint: 'Try adjusting your search.', noClipsHint: 'Analyze your first clip and get the virality X-ray.',
    analyzeClip: 'ANALYZE A CLIP', viewAnalysis: 'VIEW ANALYSIS →', goBack: '← BACK',
    analyses: (n) => `${n} ${n === 1 ? 'analysis' : 'analyses'}`,
  },
  auth: {
    loginTitle: 'Sign in', loginSubtitle: 'Access your analyses and clip history.',
    signupTitle: 'Create account', signupSubtitle: 'Start free — no credit card.',
    email: 'Email', password: 'Password', emailPlaceholder: 'your@email.com', passwordPlaceholder: 'minimum 6 characters',
    loginBtn: 'Sign in', signupBtn: 'Create account', noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
    createAccount: 'Create account', signIn: 'Sign in',
    successMsg: 'Account created! Check your email to confirm, then sign in.',
  },
  signOutModal: {
    title: 'Sign out?', message: 'Are you sure you want to sign out?',
    cancel: 'Cancel', confirm: 'Sign out',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÑOL
// ─────────────────────────────────────────────────────────────────────────────
const es: Translations = {
  nav: {
    howItWorks: 'Cómo funciona', whatAnalyzed: 'Qué analizamos',
    plans: 'Planes', faq: 'FAQ', analyzeClip: 'Analizar clip',
    myClips: 'Mis clips', signOut: 'Salir', currentPlan: 'Plan actual',
  },
  hero: {
    chip: 'ANÁLISIS DE VIRALIDAD',
    line1: '¿TU CLIP NO', line2: 'EXPLOTA?', line3: 'ENCONTRAMOS LO QUE LO MATA.',
    subtitle: 'Pega el link de TikTok, Reels o Shorts — o sube el vídeo. ClipAnalisis hace el análisis fotograma a fotograma: qué engancha, qué mata y el corte exacto para reedicitar y viralizar.',
    cta: 'Analizar mi clip', ctaSecondary: 'Ver cómo funciona',
  },
  killers: [
    'CORTE LENTO MATA', 'GANCHO DÉBIL = SCROLL', 'SUBTÍTULO SIN RITMO',
    'CLÍMAX EN EL LUGAR EQUIVOCADO', 'AUDIO SATURADO', 'PRIMER SEG. SIN GOLPE', 'SIN CTA', 'MINIATURA SIN CARA',
  ],
  howItWorks: {
    chip: 'EL MECANISMO', title: 'Tres pasos para dejar de', titleHighlight: 'publicar a ciegas',
    steps: [
      { step: '01', title: 'ENVÍA TU CLIP', body: 'Sube tu clip directamente. La IA analiza todo fotograma a fotograma.' },
      { step: '02', title: 'ClipAnalisis HACE EL ANÁLISIS', body: 'La IA cruza edición, ritmo, audio y gancho con lo que realmente retiene a la audiencia. Fotograma a fotograma.' },
      { step: '03', title: 'REEDITAS Y EXPLOTA', body: 'Recibe lo que engancha, lo que MATA y el corte exacto para rehacer. Aplica y reposta para viralizar.' },
    ],
  },
  analyzed: {
    chip: 'QUÉ SE ANALIZA', title: 'Cada fotograma pasa por el', titleHighlight: 'análisis',
    stats: [
      { label: 'mejora media de retención' }, { label: 'puntos verificados por clip' },
      { label: 'min para el análisis' }, { label: 'mayor cambio' },
    ],
    cards: [
      { tag: 'GANCHO', title: 'LOS 3 PRIMEROS SEGUNDOS', body: 'Si no golpea en el primer segundo, el resto no importa. Medimos dónde el dedo quiere hacer scroll.' },
      { tag: 'RITMO', title: 'CADENCIA DE CORTE', body: 'El corte lento mata el clip. Mapeamos el ritmo ideal para tu formato y dónde afloja.' },
      { tag: 'RETENCIÓN', title: 'CURVA DE ABANDONO', body: 'Cruzamos tu captura con la edición para encontrar el fotograma exacto en el que la gente se va.' },
      { tag: 'AUDIO', title: 'PUNCH Y MEZCLA', body: 'El audio saturado o débil destruye el alcance. Verificamos el punch, la claridad y el drop correcto.' },
      { tag: 'SUBTÍTULO', title: 'TIMING DEL SUBTÍTULO', body: 'Palabra a palabra, en el momento justo, con la keyword en el punto álgido. El subtítulo es la mitad del clip.' },
      { tag: 'CTA', title: 'GANCHO DE LOOP', body: 'El corte que conecta el final con el principio y mantiene el replay. Eso es lo que multiplica las views.' },
    ],
  },
  plans: {
    chip: 'PLANES', title: 'Elige tu', titleHighlight: 'nivel de clipper', mostChosen: 'MÁS ELEGIDO',
    items: [
      { id: 'free', name: 'FREE', price: '0€', cadence: '', tagline: '1 análisis gratis. Sin tarjeta.', features: ['1 análisis gratis', '6 pilares fotograma a fotograma + evidencia', 'Diagnóstico de retención', 'Veredicto + cuello de botella', 'Estrategias de crecimiento'], cta: 'EMPEZAR GRATIS' },
      { id: 'starter', name: 'STARTER', price: '9.99€', cadence: '/mes', tagline: 'Para empezar a publicar con dirección cada mes.', features: ['10 análisis / mes', '6 pilares + evidencia + retención', 'Veredicto + cuello de botella', 'Hasta 3 correcciones prioritarias', '1 audio / fuente / tutorial'], cta: 'SUSCRIBIRSE' },
      { id: 'pro', name: 'PRO', price: '24.99€', cadence: '/mes', tagline: 'Para el clipper que vive de publicar y quiere explotar.', features: ['Análisis ILIMITADOS', 'Correcciones prioritarias completas', 'Estrategias de crecimiento', 'Audios / fuentes / tutoriales completos', 'Cola prioritaria'], cta: 'HACERSE PRO', highlight: 'pro' },
      { id: 'elite', name: 'ELITE', price: '39.99€', cadence: '/mes', tagline: 'Para quienes viven de esto. Pro + revisión humana incluida.', features: ['Todo de Pro, ilimitado', 'Revisión humana del clip', 'Guión de edición con timestamps', 'Cola de máxima prioridad', 'Benchmark con virales del nicho', 'Acceso al grupo privado de Telegram 💬'], cta: 'UNIRSE AL ELITE', highlight: 'elite' },
    ],
  },
  social: {
    chip: 'QUIENES YA REEDITARON', title: 'De 40k a 1.2M',
    testimonials: [
      { quote: 'Reeditando siguiendo el análisis el corte llegó a 1.2M. Nunca había pasado de 40k.', author: '@cortesdozeh', role: 'Clipper' },
      { quote: 'Encontró en 2 min lo que no veía desde hacía meses: mi gancho empezaba 3s tarde.', author: '@viralou.br', role: 'Editor' },
      { quote: 'La comparación entre clips es quirúrgica. Ahora sé por qué uno explota y el otro muere.', author: '@filipecuts', role: 'Streamer' },
    ],
  },
  faq: {
    chip: 'PREGUNTAS', title: 'FAQ',
    items: [
      { q: '¿QUÉ NECESITO ENVIAR?', a: 'Sube tu clip directamente en la plataforma — no necesitas ninguna captura o screenshot. La IA analiza el vídeo fotograma a fotograma y devuelve el análisis completo.' },
      { q: '¿FUNCIONA PARA CUALQUIER NICHO?', a: 'Sí. Humor, gameplay, reacción, podcast, lifestyle. La IA calibra el ritmo ideal para tu formato.' },
      { q: '¿ES SOLO PARA CLIPS DE STREAM?', a: 'No. Cualquier vídeo corto vertical — Reels, Shorts, TikTok. El mecanismo es el mismo: lo que engancha y lo que mata.' },
      { q: '¿MIS VÍDEOS SE GUARDAN?', a: 'Solo el tiempo del análisis. Tú controlas y puedes eliminar cuando quieras. Nada se convierte en contenido de terceros.' },
      { q: '¿CUÁNTO TIEMPO TARDA?', a: 'El análisis sale en pocos minutos. En Elite, la cola prioritaria lo hace casi instantáneo.' },
    ],
  },
  finalCta: {
    line1a: 'DEJA DE', line1b: 'ADIVINAR', line2a: 'EMPIEZA A', line2b: 'EXPLOTAR',
    subtitle: 'Envía el vídeo + la captura ahora. El primer análisis es gratis.',
    cta: 'ANALIZAR MI CLIP GRATIS',
  },
  footer: {
    description: 'Análisis de viralidad para clippers. Envía tu clip, descubre lo que lo mata.',
    links: { howItWorks: 'Cómo funciona', whatAnalyzed: 'Qué analizamos', plans: 'Planes', faq: 'FAQ' },
    copyright: 'Todos los derechos reservados', tagline: 'Hecho para explotar',
  },
  analysis: {
    viralReadiness: 'PUNTUACIÓN DE VIRALIDAD', topics: 'Análisis de 20 temas',
    topicsHint: 'Haz clic en cada tema para ver el feedback y sugerencias.',
    corrections: 'Correcciones prioritarias', strategies: 'Estrategias de crecimiento',
    actionPlan: 'Plan de acción — 7 días', editPlan: 'Guión de edición',
    audios: 'Audios sugeridos', sources: 'Fuentes', tutorials: 'Tutoriales',
    scores: { excellent: 'Excelente', good: 'Bueno', decent: 'Regular', weak: 'Débil', critical: 'Crítico' },
    day: 'DÍA', goal: 'Meta',
  },
  modal: {
    limitTitle: 'LÍMITE ALCANZADO',
    limitMsg: 'Ya usaste tu análisis gratis. Mejora tu plan para continuar sin límites.',
    available: '¡Disponible ahora!', viewPlans: 'VER PLANES — ANALIZAR SIN LÍMITES', back: '← Volver',
    uploadingTitle: 'SUBIENDO…', uploadingMsg: 'Enviando el vídeo al servidor…',
    analyzingTitle: 'ANALIZANDO CLIP', analyzingMsg: 'Leyendo fotograma a fotograma — habla, subtítulo, música, efectos y final. Puede tardar 1–3 min.',
    planLabel: 'plan:', signOut: 'salir', close: 'Cerrar',
    notConfigured: 'BACKEND NO CONFIGURADO', analyzeAnother: 'ANALIZAR OTRO CLIP',
    limitPlanTitle: 'LÍMITE DEL PLAN', limitStarter: 'Alcanzaste el límite de 10 análisis este mes. Actualiza a Pro.', limitGeneric: 'Límite alcanzado. Actualiza para continuar.',
    tryAgain: 'INTENTAR DE NUEVO', errorTitle: 'ALGO SALIÓ MAL',
  },
  historico: {
    title: 'MIS CLIPS', subtitle: 'ANALIZADOS',
    noSessionTitle: 'MIS CLIPS', noSessionMsg: 'Inicia sesión para acceder a tu historial de análisis.',
    statsTotal: 'Total de clips', statsAvg: 'Puntuación media', statsBest: 'Mejor puntuación',
    search: 'Buscar por plataforma o nicho…', noResults: 'SIN RESULTADOS', noClips: 'SIN CLIPS AÚN',
    noResultsHint: 'Intenta ajustar la búsqueda.', noClipsHint: 'Analiza tu primer clip y recibe el análisis de viralidad.',
    analyzeClip: 'ANALIZAR UN CLIP', viewAnalysis: 'VER ANÁLISIS →', goBack: '← VOLVER',
    analyses: (n) => `${n} ${n === 1 ? 'análisis' : 'análisis'}`,
  },
  auth: {
    loginTitle: 'Iniciar sesión', loginSubtitle: 'Accede a tus análisis e historial de clips.',
    signupTitle: 'Crear cuenta', signupSubtitle: 'Empieza gratis — sin tarjeta de crédito.',
    email: 'Email', password: 'Contraseña', emailPlaceholder: 'tu@email.com', passwordPlaceholder: 'mínimo 6 caracteres',
    loginBtn: 'Entrar', signupBtn: 'Crear cuenta', noAccount: '¿No tienes cuenta?', hasAccount: '¿Ya tienes cuenta?',
    createAccount: 'Crear cuenta', signIn: 'Entrar',
    successMsg: '¡Cuenta creada! Revisa tu email para confirmar y luego entra.',
  },
  signOutModal: {
    title: '¿Cerrar sesión?', message: '¿Estás seguro de que quieres cerrar la sesión?',
    cancel: 'Cancelar', confirm: 'Cerrar sesión',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Context & Provider
// ─────────────────────────────────────────────────────────────────────────────
const LS_KEY = 'language';
const all = { pt, en, es } as const;

function getSavedLang(): Lang {
  try {
    const saved = localStorage.getItem(LS_KEY) as Lang | null;
    return saved && saved in all ? saved : 'pt';
  } catch {
    return 'pt';
  }
}

interface LanguageCtx {
  lang: Lang;
  setLanguage: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageCtx>({
  lang: 'pt',
  setLanguage: () => {},
  t: pt,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getSavedLang);

  const setLanguage = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LS_KEY, l); } catch { /* ignore */ }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t: all[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** @deprecated use LanguageProvider */
export const I18nProvider = LanguageProvider;

export function useI18n() {
  return useContext(LanguageContext);
}

export const FLAGS: Record<Lang, string> = { pt: '🇵🇹', en: '🇬🇧', es: '🇪🇸' };
export const LANG_LABELS: Record<Lang, string> = { pt: 'PT', en: 'EN', es: 'ES' };
