import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseOutput, getPhaseInput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 8: Vývoj — Development (continuous) */
export async function runPhase8(ctx: AgentContext): Promise<Record<string, unknown>> {
  const epOutput = await getPhaseOutput(ctx.projectId, 4);
  const input = await getPhaseInput(ctx.projectId, ctx.phaseId);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  const ticketUrl = (input?.ticketUrl as string) ?? '';

  await ctx.publishLog('ok', `Analyzuji ticket: ${ticketUrl || 'N/A'}...`);
  await ctx.publishLog('ok', 'Implementuji změny...');

  // TODO: Real Jira ticket fetch + code agent implementation
  const userPrompt = `Na základě EP a ticketu implementuj požadované změny.

EP: ${JSON.stringify(epOutput, null, 2)}
Ticket URL: ${ticketUrl}

Výstup MUSÍ být validní JSON:
{
  "summary": "string",
  "prUrl": "string or null",
  "jiraTicket": "string or null",
  "changes": ["string"]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
