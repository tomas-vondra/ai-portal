import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 3: Koncept & Rozhodnutí — Solution concept */
export async function runPhase3(ctx: AgentContext): Promise<Record<string, unknown>> {
  const discoveryOutput = await getPhaseOutput(ctx.projectId, 2);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  if (!discoveryOutput) throw new Error('Výstup z fáze Discovery není dostupný');

  await ctx.publishLog('ok', 'Načítám výstup z Discovery fáze...');
  await ctx.publishLog('ok', 'Navrhuji koncept řešení...');

  const userPrompt = `Na základě výstupu z Discovery fáze navrhni koncept řešení.

DISCOVERY VÝSTUP:
${JSON.stringify(discoveryOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "approach": {"recommended": "Fixed-price|T&M", "reasoning": "string"},
  "sitemap": [{"level": 0, "name": "string"}],
  "screens": ["string"],
  "openQuestions": ["string"],
  "presentation": [{"slide": "string", "bullets": ["string"]}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
