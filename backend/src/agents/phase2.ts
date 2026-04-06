import type { AgentContext } from './base.js';
import { callLLM, parseJsonOutput } from './integrations/llm.js';
import { getPhaseInput, getPhaseSystemPrompt, getUploadedTexts } from './helpers.js';

/** Phase 2: Discovery — Document analysis */
export async function runPhase2(ctx: AgentContext): Promise<Record<string, unknown>> {
  const input = await getPhaseInput(ctx.projectId, ctx.phaseId);
  const systemPrompt = await getPhaseSystemPrompt(ctx.projectId, ctx.phaseId);

  // Get text from either uploaded file or direct text input
  const uploadedTexts = await getUploadedTexts(ctx.projectId, ctx.phaseId);
  const directText = (input?.text as string) ?? '';
  const documentText = uploadedTexts.length > 0 ? uploadedTexts.join('\n\n') : directText;

  if (!documentText) {
    throw new Error('Žádný vstupní dokument k analýze');
  }

  await ctx.publishLog('ok', `Analyzuji vstupní dokument (${documentText.split(/\s+/).length} slov)...`);
  await ctx.publishLog('ok', 'Identifikuji klíčové problémy...');
  await ctx.publishLog('ok', 'Extrahuji požadované funkcionality...');

  const userPrompt = `Analyzuj následující dokument a extrahuj klíčové informace.

DOKUMENT:
${documentText}

Výstup MUSÍ být validní JSON s touto strukturou:
{
  "problemDefinition": "string",
  "functionalities": [{"text": "string", "citation": "string"}],
  "userRoles": [{"text": "string", "citation": "string"}],
  "openQuestions": [{"text": "string", "priority": "high|medium|low"}],
  "risks": ["string"]
}`;

  const result = await callLLM({ systemPrompt, userPrompt, ctx });
  return parseJsonOutput(result);
}
