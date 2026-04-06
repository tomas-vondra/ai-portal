import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseInput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 5: Nabídka & Plán — Offer & Plan */
export async function runPhase5(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const input = await getPhaseInput(ctx.projectId, ctx.phaseId);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  if (!epOutput) throw new Error('Výstup z fáze EP není dostupný');

  const hourlyRate = (input?.hourlyRate as number) ?? 2500;

  await ctx.publishLog('ok', 'Načítám Engineering Project...');
  await ctx.publishLog('ok', `Generuji nabídku (sazba: ${hourlyRate} Kč/h)...`);

  const userPrompt = `Na základě EP rozpadni projekt na epics/stories, odhadni MD a vytvoř harmonogram.

EP:
${JSON.stringify(epOutput, null, 2)}

Hodinová sazba: ${hourlyRate} Kč/h (8h/den)

Výstup MUSÍ být validní JSON:
{
  "totalMD": number,
  "hourlyRate": number,
  "totalPrice": "string (formátovaná cena)",
  "epics": [{"name": "string", "stories": [{"name": "string", "md": number}]}],
  "milestones": [{"name": "string", "week": number, "description": "string"}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
