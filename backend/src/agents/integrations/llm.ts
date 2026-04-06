import { generateText, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { AgentContext } from '../base.js';

export interface LLMCallOptions {
  systemPrompt: string;
  userPrompt: string;
  ctx: AgentContext;
  model?: string;
}

export async function callLLM(opts: LLMCallOptions): Promise<string> {
  const { systemPrompt, userPrompt, ctx, model } = opts;

  await ctx.publishLog('info', 'Volám LLM...');

  const result = await generateText({
    model: anthropic(model ?? 'claude-sonnet-4-20250514'),
    system: systemPrompt,
    prompt: userPrompt,
  });

  await ctx.publishLog('ok', `LLM odpověděl (${result.usage?.totalTokens ?? '?'} tokenů)`);

  return result.text;
}

export async function callLLMStreaming(opts: LLMCallOptions): Promise<string> {
  const { systemPrompt, userPrompt, ctx, model } = opts;

  await ctx.publishLog('info', 'Volám LLM (streaming)...');

  const result = streamText({
    model: anthropic(model ?? 'claude-sonnet-4-20250514'),
    system: systemPrompt,
    prompt: userPrompt,
  });

  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  const usage = await result.usage;
  await ctx.publishLog('ok', `LLM odpověděl (${usage?.totalTokens ?? '?'} tokenů)`);

  return fullText;
}

export function parseJsonOutput(text: string): Record<string, unknown> {
  // Try to extract JSON from markdown code blocks or raw JSON
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(text);
}
