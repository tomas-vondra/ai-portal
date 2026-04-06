import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 9: Delivery & Scope Control (continuous) */
export async function runPhase9(ctx: AgentContext): Promise<Record<string, unknown>> {
  const offerOutput = await getPhaseOutput(ctx.projectId, 5);
  const setupOutput = await getPhaseOutput(ctx.projectId, 7);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  await ctx.publishLog('ok', 'Porovnávám stav projektu s harmonogramem...');

  // TODO: Real Jira API integration for current sprint/board state
  const userPrompt = `Porovnej aktuální stav projektu s harmonogramem a identifikuj odchylky.

HARMONOGRAM: ${JSON.stringify(offerOutput, null, 2)}
SETUP: ${JSON.stringify(setupOutput, null, 2)}

Výstup MUSÍ být validní JSON:
{
  "completionPercent": number,
  "plannedPercent": number,
  "currentSprint": "string",
  "deviations": [{"type": "delay|scope|blocker", "description": "string", "action": "string"}],
  "timeline": [{"milestone": "string", "planned": "string", "actual": "string", "status": "done|delayed|pending"}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
