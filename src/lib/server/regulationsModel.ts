import 'server-only';
import { buildMessages, extractJson } from '@/lib/regulationsAi';
import { parseAiPlan, type AiPlan } from '@/lib/regulations';

/**
 * Calls an OpenAI-compatible chat-completions endpoint, so any host of an
 * open-weight model works (Groq, OpenRouter, Together, Cloudflare Workers AI,
 * or a self-hosted vLLM/Ollama behind a public URL) by changing three env vars.
 * See .env.example.
 */
export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
}

export function getModelConfig(): ModelConfig | null {
  const baseUrl = process.env.REGS_AI_BASE_URL?.trim().replace(/\/+$/, '');
  const apiKey = process.env.REGS_AI_API_KEY?.trim();
  const model = process.env.REGS_AI_MODEL?.trim();
  if (!baseUrl || !apiKey || !model) return null;
  const maxTokens = Number(process.env.REGS_AI_MAX_TOKENS) || 1200;
  return { baseUrl, apiKey, model, maxTokens };
}

const TIMEOUT_MS = 20_000;

async function complete(cfg: ModelConfig, idea: string, jsonMode: boolean): Promise<Response> {
  return fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: buildMessages(idea),
      temperature: 0,
      max_tokens: cfg.maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
}

/**
 * Ask the model which rules apply. Returns null when it answers with nothing
 * usable. Throws when the provider is unreachable or rejects the request, so
 * the route can tell "AI unavailable" apart from "AI had no opinion".
 */
export async function askModel(cfg: ModelConfig, idea: string): Promise<AiPlan | null> {
  // Not every host supports JSON mode; a 400 is usually that, so retry once
  // without it and rely on extractJson() to find the object in the reply.
  let res = await complete(cfg, idea, true);
  if (res.status === 400) res = await complete(cfg, idea, false);
  if (!res.ok) throw new Error(`Model host returned ${res.status}`);

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? '';
  return parseAiPlan(extractJson(text));
}
