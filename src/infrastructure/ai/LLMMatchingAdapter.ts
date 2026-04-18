import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  IMatchingPort,
  MatchingRequest,
  MatchingResult,
} from '../../application/ports/output/IMatchingPort';

export interface LLMMatchingAdapterConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxAttempts: number;
}

/**
 * Provider-agnostic LLM adapter that talks to any OpenAI-compatible
 * `/chat/completions` endpoint (OpenAI, xAI Grok, Groq, Together, etc.).
 *
 * Uses JSON Schema structured outputs to guarantee parseable responses.
 * Candidates are already pre-filtered by the domain rules; the LLM only
 * produces ranking + reasoning.
 */
export class LLMMatchingAdapter implements IMatchingPort {
  private readonly config: LLMMatchingAdapterConfig;
  private readonly systemPrompt: string;

  constructor(config: Partial<LLMMatchingAdapterConfig> = {}) {
    const resolved: LLMMatchingAdapterConfig = {
      apiKey: config.apiKey ?? process.env.AI_API_KEY ?? '',
      baseUrl: config.baseUrl ?? process.env.AI_API_BASE_URL ?? 'https://api.openai.com/v1',
      model: config.model ?? process.env.AI_MODEL ?? 'gpt-4o-mini',
      timeoutMs: config.timeoutMs ?? Number(process.env.AI_API_TIMEOUT_MS ?? 15000),
      maxAttempts: config.maxAttempts ?? 3,
    };

    if (!resolved.apiKey) {
      throw new Error('LLMMatchingAdapter requires AI_API_KEY');
    }

    this.config = resolved;
    this.systemPrompt = loadSystemPrompt();
  }

  async findMatches(request: MatchingRequest): Promise<MatchingResult[]> {
    if (request.candidates.length === 0) return [];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      return await this.callWithRetry(request, controller.signal);
    } finally {
      clearTimeout(timer);
    }
  }

  private async callWithRetry(
    request: MatchingRequest,
    signal: AbortSignal,
    attempt = 0,
  ): Promise<MatchingResult[]> {
    try {
      return await this.call(request, signal);
    } catch (err) {
      const isRetryable =
        err instanceof Error &&
        !err.message.match(/^LLM API 4\d\d:/) &&
        !signal.aborted;

      if (attempt < this.config.maxAttempts - 1 && isRetryable) {
        const backoffMs = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, backoffMs));
        return this.callWithRetry(request, signal, attempt + 1);
      }
      throw err;
    }
  }

  private async call(request: MatchingRequest, signal: AbortSignal): Promise<MatchingResult[]> {
    const candidateIds = new Set(request.candidates.map((c) => c.professionalId));

    const res = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: JSON.stringify(request) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'matching_results',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['matches'],
              properties: {
                matches: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['professionalId', 'score', 'reasoning'],
                    properties: {
                      professionalId: { type: 'string' },
                      score: { type: 'number', minimum: 0, maximum: 1 },
                      reasoning: { type: 'string', minLength: 10 },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`LLM API ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM API returned no content');

    const parsed = JSON.parse(content) as { matches?: unknown };
    if (!Array.isArray(parsed.matches)) {
      throw new Error('LLM API returned malformed matches payload');
    }

    const results: MatchingResult[] = [];
    for (const raw of parsed.matches) {
      if (
        typeof raw !== 'object' ||
        raw === null ||
        typeof (raw as Record<string, unknown>).professionalId !== 'string' ||
        typeof (raw as Record<string, unknown>).score !== 'number' ||
        typeof (raw as Record<string, unknown>).reasoning !== 'string'
      ) {
        continue;
      }
      const item = raw as { professionalId: string; score: number; reasoning: string };
      if (!candidateIds.has(item.professionalId)) continue; // ignore hallucinated IDs
      results.push({
        professionalId: item.professionalId,
        score: clamp(item.score, 0, 1),
        reasoning: item.reasoning.trim(),
        modelVersion: this.config.model,
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, request.maxResults);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function loadSystemPrompt(): string {
  // Using `new URL(..., import.meta.url)` so Next.js output file tracing
  // picks up the markdown file and copies it to the serverless bundle.
  const promptUrl = new URL('./prompts/matchSystemPrompt.md', import.meta.url);
  try {
    return readFileSync(fileURLToPath(promptUrl), 'utf8');
  } catch {
    // Fallback for unusual runtimes: resolve from repo cwd.
    const fallback = join(
      process.cwd(),
      'src',
      'infrastructure',
      'ai',
      'prompts',
      'matchSystemPrompt.md',
    );
    return readFileSync(fallback, 'utf8');
  }
}
