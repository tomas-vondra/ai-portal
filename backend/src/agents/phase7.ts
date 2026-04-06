import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 7: Projektový Setup — Ticket breakdown */
export async function runPhase7(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const offerOutput = await getPhaseOutput(ctx.projectId, 5);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  if (!offerOutput) throw new Error('Výstup z fáze Nabídka není dostupný');

  await ctx.publishLog('ok', 'Načítám EP a nabídku...');
  await ctx.publishLog('ok', 'Generuji rozpad ticketů...');

  const userPrompt = `Na základě EP a nabídky vytvoř rozpad na epics/stories/tasky.

EP: ${JSON.stringify(epOutput, null, 2)}
NABÍDKA: ${JSON.stringify(offerOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "tickets": [{"id": "string", "type": "epic|story|task", "name": "string", "points": number, "parentId": "string|null"}],
  "githubUrl": null,
  "jiraUrl": null,
  "step": 1
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
