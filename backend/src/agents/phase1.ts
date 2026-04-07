import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseInput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 1: Kontakt & Lead — Company research */
export async function runPhase1(ctx: AgentContext): Promise<Record<string, unknown>> {
  const input = await getPhaseInput(ctx.projectId, ctx.phaseId);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  const companyName = (input?.companyName as string) ?? 'Unknown';
  const rawSources = input?.sources;
  // Sources can be an object { google: true, linkedin: false, ... } or an array of strings
  const sources: string[] = Array.isArray(rawSources)
    ? rawSources
    : typeof rawSources === 'object' && rawSources !== null
      ? Object.entries(rawSources as Record<string, boolean>)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      : ['Google', 'LinkedIn', 'ARES'];

  await ctx.publishLog('ok', `Prohledávám zdroje pro: ${companyName}`);

  for (const source of sources) {
    await ctx.publishLog('ok', `Prohledávám ${source}...`);
  }

  const userPrompt = `Proveď research firmy "${companyName}" a vytvoř strukturovaný report.

Výstup MUSÍ být validní JSON s touto strukturou:
{
  "companyName": "string",
  "description": "string",
  "domain": "string",
  "legalStatus": "string",
  "ico": "string or null",
  "keyPeople": [{"name": "string", "position": "string"}],
  "estimatedRevenue": "string",
  "signals": [{"text": "string", "severity": "green|orange|red"}]
}

Zdroje k použití: ${sources.join(', ')}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
