// Server-side output gating. The 6 pillars + evidence + retention + veredicto +
// gargalo are in EVERY plan. This trims the extras per the plan table. The
// client only renders what survives here — never trust the client for plan.
import type { AiResult, PlanTier } from './types.ts';

export function gateResult(full: AiResult, plan: PlanTier): AiResult {
  const r: AiResult = structuredClone(full);

  // edit_plan + plano_acao_7dias: Elite only
  if (plan !== 'elite') { r.edit_plan = []; r.plano_acao_7dias = []; }

  // estratégias de crescimento (bloco extra): free, pro, elite — NOT starter
  if (plan === 'starter') r.estrategias_crescimento = [];

  if (plan === 'starter') {
    // correções: até 3
    r.correcoes_prioritarias = r.correcoes_prioritarias.slice(0, 3);
    // áudios / fontes / tutoriais: 1 de cada
    r.audios_sugeridos = r.audios_sugeridos.slice(0, 1);
    r.fontes = r.fontes.slice(0, 1);
    r.tutoriais = r.tutoriais.slice(0, 1);
  }

  return r;
}

/** Whether the weekly comparison view is unlocked (frontend reads tracking). */
export function comparativoSemanal(plan: PlanTier): boolean {
  return plan === 'elite';
}
