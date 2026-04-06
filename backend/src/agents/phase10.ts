import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseInput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 10: Testování (continuous) */
export async function runPhase10(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const input = await getPhaseInput(ctx.projectId, ctx.phaseId);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  const testUrl = (input?.testUrl as string) ?? '';

  await ctx.publishLog('ok', `Spouštím testy na: ${testUrl || 'N/A'}...`);

  // TODO: Real automated testing against the URL
  const userPrompt = `Na základě akceptačních kritérií z EP spusť testy a zaznamenej výsledky.

EP: ${JSON.stringify(epOutput, null, 2)}
Test URL: ${testUrl}

Výstup MUSÍ být validní JSON:
{
  "results": [{"id": "string", "scenario": "string", "status": "passed|failed|skipped", "description": "string or null", "severity": "critical|high|medium|low or null"}],
  "bugs": [{"id": "string", "description": "string", "severity": "critical|high|medium|low", "scenario": "string"}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
