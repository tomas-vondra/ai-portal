import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 4: Engineering Project */
export async function runPhase4(ctx: AgentContext): Promise<Record<string, unknown>> {
  const conceptOutput = await getPhaseOutput(ctx.projectId, 3);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  if (!conceptOutput) throw new Error('Výstup z fáze Koncept není dostupný');

  await ctx.publishLog('ok', 'Načítám koncept řešení...');
  await ctx.publishLog('ok', 'Generuji Engineering Project...');

  const userPrompt = `Na základě konceptu vytvoř detailní Engineering Project.

KONCEPT:
${JSON.stringify(conceptOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "functionalRequirements": ["string"],
  "nonFunctionalRequirements": ["string"],
  "techStack": "string",
  "hosting": "string",
  "maintenance": "string",
  "scope": {"included": ["string"], "excluded": ["string"]}
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
