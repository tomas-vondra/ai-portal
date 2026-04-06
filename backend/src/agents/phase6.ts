import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt, getUploadedTexts } from './helpers.js';

/** Phase 6: Smlouvy — Contract analysis */
export async function runPhase6(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const offerOutput = await getPhaseOutput(ctx.projectId, 5);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);
  const contractTexts = await getUploadedTexts(ctx.projectId, ctx.phaseId);

  if (contractTexts.length === 0) throw new Error('Žádná smlouva k analýze');

  await ctx.publishLog('ok', 'Analyzuji smlouvu...');
  await ctx.publishLog('ok', 'Porovnávám s EP a nabídkou...');

  const userPrompt = `Analyzuj smlouvu a porovnej ji s EP a nabídkou. Identifikuj rizika.

SMLOUVA:
${contractTexts.join('\n\n')}

EP: ${JSON.stringify(epOutput, null, 2)}
NABÍDKA: ${JSON.stringify(offerOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "risks": [{"id": "string", "title": "string", "description": "string", "severity": "critical|warning|info", "citation": "string"}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
