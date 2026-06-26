/** Single source of truth for site copy. Clipador voice — curta, CAPS onde cabe. */

export const KILLERS = [
  'CORTE LENTO MATA',
  'GANCHO FRACO = SCROLL',
  'LEGENDA SEM RITMO',
  'CLÍMAX NO LUGAR ERRADO',
  'ÁUDIO ESTOURADO',
  'PRIMEIRO SEG. SEM SOCO',
  'CTA INEXISTENTE',
  'THUMB SEM CARA',
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'MANDA O TEU CLIP',
    body: 'Faz upload do teu clip directamente. A IA analisa tudo frame a frame.',
  },
  {
    step: '02',
    title: 'A ClipAnalisis FAZ O RAIO-X',
    body: 'A IA cruza edição, ritmo, áudio e gancho com o que de fato segura a audiência. Frame a frame.',
  },
  {
    step: '03',
    title: 'VOCÊ REEDITA E ESTOURA',
    body: 'Recebe o que prende, o que MATA e o corte exato pra refazer. Aplica e reposta pra viralizar.',
  },
];

export const ANALYZED = [
  { tag: 'GANCHO', title: 'OS 3 PRIMEIROS SEGUNDOS', body: 'Se não dá soco no primeiro segundo, o resto não importa. A gente mede onde o dedo quer rolar.' },
  { tag: 'RITMO', title: 'CADÊNCIA DE CORTE', body: 'Corte lento mata clip. Mapeamos o ritmo ideal pro teu formato e onde ele afrouxa.' },
  { tag: 'RETENÇÃO', title: 'CURVA DE ABANDONO', body: 'Analisamos a edição frame a frame pra achar o momento exato em que o povo some.' },
  { tag: 'ÁUDIO', title: 'PUNCH & MIXAGEM', body: 'Áudio estourado ou mole derruba alcance. Checamos punch, clareza e o drop certo.' },
  { tag: 'LEGENDA', title: 'TIMING DA LEGENDA', body: 'Palavra a palavra, no tempo certo, com a keyword no ouro. Legenda é metade do clip.' },
  { tag: 'CTA', title: 'GANCHO DE LOOP', body: 'O corte que liga o fim no começo e segura o replay. É o que multiplica view.' },
];

export interface Plan {
  /** matches the DB plan_tier enum + gating */
  id: 'free' | 'starter' | 'pro' | 'elite';
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlight?: 'pro' | 'elite';
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'FREE',
    price: '0€',
    cadence: '/dia',
    tagline: '1 análise por dia, reset às 24h. Sem cartão.',
    features: [
      '1 análise / dia (reset 24h)',
      '6 pilares frame a frame + evidência',
      'Diagnóstico de retenção',
      'Veredito + gargalo',
      'Estratégias de crescimento',
    ],
    cta: 'COMEÇAR GRÁTIS',
  },
  {
    id: 'starter',
    name: 'STARTER',
    price: '9.99€',
    cadence: '/mês',
    tagline: 'Pra começar a postar com direção todo mês.',
    features: [
      '10 análises / mês',
      '6 pilares + evidência + retenção',
      'Veredito + gargalo',
      'Até 3 correções prioritárias',
      '1 áudio / fonte / tutorial',
    ],
    cta: 'ASSINAR STARTER',
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '24.99€',
    cadence: '/mês',
    tagline: 'Pro clipador que vive de postar e quer estourar.',
    features: [
      'Análises ILIMITADAS',
      'Correções prioritárias completas',
      'Estratégias de crescimento',
      'Áudios / fontes / tutoriais completos',
      'Prioridade na fila',
    ],
    highlight: 'pro',
    cta: 'VIRAR PRO',
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: '39.99€',
    cadence: '/mês',
    tagline: 'Pra quem vive disso. Pro + revisão humana incluída.',
    features: [
      'Tudo do Pro, ilimitado',
      'Revisão humana do clip',
      'Roteiro de edição com timestamps',
      'Prioridade máxima na fila',
      'Benchmark com virais do nicho',
    ],
    highlight: 'elite',
    cta: 'ENTRAR NO ELITE',
  },
];

export const SOCIAL = [
  { quote: 'Reeditei seguindo o raio-X e o corte bateu 1.2M. Nunca tinha passado de 40k.', author: '@cortesdozeh', role: 'Clipador' },
  { quote: 'Achou em 2 min o que eu não via há meses: meu gancho começava 3s tarde.', author: '@viralou.br', role: 'Editor' },
  { quote: 'O comparativo entre clips é cirúrgico. Hoje eu sei por que um estoura e o outro morre.', author: '@filipecuts', role: 'Streamer' },
];

export const FAQ = [
  { q: 'O QUE PRECISO DE ENVIAR?', a: 'Faz upload do teu clip directamente — não precisas de nada além do vídeo. A IA analisa tudo frame a frame.' },
  { q: 'FUNCIONA PRA QUALQUER NICHO?', a: 'Sim. Humor, gameplay, reação, podcast, lifestyle. A IA calibra o ritmo ideal pro teu formato.' },
  { q: 'É SÓ CLIP DE STREAM?', a: 'Não. Qualquer vídeo curto vertical — Reels, Shorts, TikTok. O mecanismo é o mesmo: o que prende e o que mata.' },
  { q: 'MEUS VÍDEOS FICAM GUARDADOS?', a: 'Só o tempo da análise. Você controla e pode apagar quando quiser. Nada vira conteúdo de terceiros.' },
  { q: 'QUANTO TEMPO DEMORA?', a: 'O raio-X sai em poucos minutos. No Elite, fila prioritária deixa quase instantâneo.' },
];
