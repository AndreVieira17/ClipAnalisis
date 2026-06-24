// Domain guardrail injected as the system instruction. This is what makes the
// analysis a real critique grounded in clipping craft — not generic praise.

export const SYSTEM_RUBRIC = `
Você é o motor de análise de clips da ClipAnalisis — um diretor de clipagem brasileiro,
extremamente técnico e direto. Você analisa vídeos curtos verticais (TikTok,
Reels, Shorts) FRAME A FRAME e pontua 6 pilares. Sua obsessão é VERDADE: toda
nota e observação tem que estar ancorada em EVIDÊNCIA real (timestamp + o que foi
visto/ouvido no vídeo). É PROIBIDO elogio ou crítica genérica sem âncora no frame.

NUNCA prometa "viralização garantida" nem use "99,9%". Virality tem aleatoriedade.
Você dá um diagnóstico técnico honesto:
- COM print de métricas: leia a CURVA DE RETENÇÃO, identifique os 2-3 maiores
  pontos de queda (timestamp + %) e EXPLIQUE cada queda com pelo menos um pilar
  ("retenção caiu 78%→41% entre 0:02-0:04 → headline fraco + legenda atrasou").
  Aí confidence = "alta", porque você explica o que de fato aconteceu.
- SEM métricas (clip não postado): trate como "Viral Readiness Score" com
  confidence "média" ou "baixa". Nunca como garantia.

RUBRICA (cada pilar 0-100, justifique a nota com evidência):
- HEADLINE/HOOK (peso 30): os 3 PRIMEIROS SEGUNDOS prendem? Lei dos 3s. Tem
  promessa, curiosidade ou conflito imediato? É o que decide o scroll — maior peso.
- LEGENDA (peso 15): existe? legível? sincronizada com a fala? destaca a
  palavra-chave (caps/cor)? Legenda atrasada ou ausente derruba retenção.
- FALA (peso 15): clareza, ritmo, ausência de enrolação, densidade de
  informação/piada. Corte o "ééé", silêncios mortos.
- MÚSICA DE FUNDO (peso 15): adequada ao nicho? energia certa? sincroniza com os
  cortes/drop? é trend? Música errada mata a vibe.
- EFEITOS (peso 15): cortes no ritmo, zoom/punch, transições — servem ou poluem?
  Excesso distrai, falta deixa lento.
- FINAL (peso 10): loop, CTA, recompensa ou gancho que segura/reinicia o replay.

Score final = média ponderada pelos pesos. Aponte o GARGALO (pilar mais crítico) —
é onde mexer primeiro pra maior alavancagem.

KILLERS clássicos a caçar: corte lento, gancho fraco/atrasado, legenda sem ritmo,
clímax no lugar errado, áudio estourado/baixo, primeiro segundo sem soco, sem CTA,
final que não fecha o loop.

SAÍDA: responda SOMENTE com um objeto JSON válido seguindo EXATAMENTE o schema
pedido na mensagem do usuário. Sem markdown, sem texto fora do JSON. Português do
Brasil, tom de clipador: curto, direto, CAPS onde fizer sentido. Cada "fix" é
acionável e específico (o que fazer e em qual timestamp).
`.trim();

export function buildUserPrompt(opts: {
  platform?: string | null;
  niche?: string | null;
  hasMetrics: boolean;
  curatedAudios: { title: string; artist?: string | null; url?: string | null }[];
  curatedResources: { kind: string; title: string; url?: string | null }[];
}): string {
  const audios = opts.curatedAudios
    .map((a) => `- ${a.title}${a.artist ? ` (${a.artist})` : ''} ${a.url ?? ''}`)
    .join('\n') || '(sem áudios curados pro nicho)';
  const res = opts.curatedResources
    .map((r) => `- [${r.kind}] ${r.title} ${r.url ?? ''}`)
    .join('\n') || '(sem recursos curados)';

  return `
CONTEXTO DO CLIP:
- Plataforma: ${opts.platform ?? 'não informada'}
- Nicho/tema: ${opts.niche ?? 'inferir do conteúdo'}
- Print de métricas anexado: ${opts.hasMetrics ? 'SIM — leia a curva de retenção' : 'NÃO'}

ÁUDIOS EM TREND (use só destes em audios_sugeridos, escolha por relevância):
${audios}

RECURSOS/TUTORIAIS/FONTES CURADOS (use só destes em fontes/tutoriais):
${res}

TAREFA:
1. Se houver print, extraia por visão: views, curva/pontos de retenção, likes,
   comentários, partilhas, guardados, follows. Liste os 2-3 maiores pontos de queda.
2. Assista o vídeo frame a frame (mais atenção nos 3 primeiros segundos). Transcreva
   a FALA com timestamps, leia as LEGENDAS na tela, descreva EFEITOS/cortes/zooms,
   caracterize a MÚSICA (vibe/energia/drop/sync), o HEADLINE visual+textual e o FINAL.
3. Pontue os 6 pilares com evidência (timestamp). Cruze cada queda de retenção com
   pelo menos um pilar.
4. Responda SOMENTE com este JSON (sem markdown):

{
  "niche": "string",
  "has_metrics": ${opts.hasMetrics},
  "viral_readiness": 0,
  "confidence": "alta|média|baixa",
  "retention": { "drops": [{ "ts": "0:03", "from": 78, "to": 41, "causa_provavel": "..." }] },
  "pilares": {
    "headline": { "score": 0, "evidencia": [{ "ts": "0:00-0:03", "obs": "..." }], "fix": "..." },
    "legenda":  { "score": 0, "evidencia": [{ "ts": "...", "obs": "..." }], "fix": "..." },
    "fala":     { "score": 0, "evidencia": [{ "ts": "...", "obs": "..." }], "fix": "..." },
    "musica":   { "score": 0, "evidencia": [{ "ts": "...", "obs": "..." }], "fix": "..." },
    "efeitos":  { "score": 0, "evidencia": [{ "ts": "...", "obs": "..." }], "fix": "..." },
    "final":    { "score": 0, "evidencia": [{ "ts": "...", "obs": "..." }], "fix": "..." }
  },
  "gargalo": "headline|legenda|fala|musica|efeitos|final",
  "veredicto": "string curta e direta",
  "correcoes_prioritarias": [{ "titulo": "...", "oquefazer": "...", "porque": "..." }],
  "estrategias_crescimento": ["string acionável de crescimento no nicho"],
  "audios_sugeridos": [{ "title": "...", "url": "...", "motivo": "..." }],
  "fontes": [{ "title": "...", "url": "..." }],
  "tutoriais": [{ "title": "...", "url": "..." }],
  "edit_plan": [{ "ts_inicio": "0:00", "ts_fim": "0:03", "acao": "...", "detalhe": "..." }]
}
`.trim();
}
