import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseInput, getPhaseSystemPrompt } from './helpers.js';

/** Phase 13: Provoz & Další Rozvoj (continuous) */
export async function runPhase13(ctx: AgentContext): Promise<Record<string, unknown>> {
  const input = await getPhaseInput(ctx.projectId, ctx.phaseId);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  const monitoringUrl = (input?.monitoringUrl as string) ?? '';

  await ctx.publishLog('ok', `Stahuji metriky z: ${monitoringUrl || 'N/A'}...`);

  // TODO: Real Grafana/Kibana API integration
  const userPrompt = `Stáhni klíčové metriky a analyzuj stav systému.

Monitoring URL: ${monitoringUrl}

Výstup MUSÍ být validní JSON:
{
  "health": {"uptime": "string", "avgLatency": "string", "errorRate": "string", "lastIncident": "string"},
  "anomalies": [{"timestamp": "string", "description": "string", "severity": "warning|critical"}],
  "backlog": [{"priority": "high|medium|low", "description": "string"}]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
