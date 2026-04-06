import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 11: Dokumentace (continuous) */
export async function runPhase11(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const setupOutput = await getPhaseOutput(ctx.projectId, 7);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  await ctx.publishLog('ok', 'Generuji dokumentaci...');

  // TODO: Real GitHub repo code analysis
  const userPrompt = `Na základě EP a kódu vygeneruj tři dokumenty.

EP: ${JSON.stringify(epOutput, null, 2)}
SETUP: ${JSON.stringify(setupOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "documents": [{"name": "string", "type": "user|admin|ops", "pages": number, "format": "DOCX|MD"}],
  "warning": "string or null"
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
