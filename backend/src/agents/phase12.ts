import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 12: Předání & Akceptace */
export async function runPhase12(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const offerOutput = await getPhaseOutput(ctx.projectId, 5);
  const contractOutput = await getPhaseOutput(ctx.projectId, 6);
  const testOutput = await getPhaseOutput(ctx.projectId, 10);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  await ctx.publishLog('ok', 'Připravuji akceptační protokol...');

  const userPrompt = `Na základě všech fází připrav akceptační protokol a předávací dokumenty.

EP: ${JSON.stringify(epOutput, null, 2)}
NABÍDKA: ${JSON.stringify(offerOutput, null, 2)}
SMLOUVA: ${JSON.stringify(contractOutput, null, 2)}
TESTY: ${JSON.stringify(testOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "protocol": {"projectName": "string", "deliveredDate": "string", "items": [{"name": "string", "status": "delivered|partial|excluded", "reason": "string or null"}]},
  "summary": "string",
  "presentation": [{"slide": "string", "bullets": ["string"]}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
