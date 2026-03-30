import { IMatchingPort, MatchingRequest, MatchingResult } from '../../application/ports/output/IMatchingPort';

export class HttpMatchingAdapter implements IMatchingPort {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor() {
    const baseUrl = process.env.AI_API_BASE_URL;
    const apiKey = process.env.AI_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new Error('AI_API_BASE_URL and AI_API_KEY environment variables are required');
    }
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.timeoutMs = Number(process.env.AI_API_TIMEOUT_MS ?? 10000);
  }

  async findMatches(request: MatchingRequest): Promise<MatchingResult[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchWithRetry(request, controller.signal);
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchWithRetry(
    request: MatchingRequest,
    signal: AbortSignal,
    attempt = 0,
  ): Promise<MatchingResult[]> {
    const maxAttempts = 3;
    try {
      const res = await fetch(`${this.baseUrl}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal,
      });

      if (!res.ok) {
        throw new Error(`AI API responded with status ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('AI API returned an unexpected response format');
      }

      return data.map((item: unknown) => this.parseResult(item));
    } catch (err) {
      if (attempt < maxAttempts - 1 && !signal.aborted) {
        const backoffMs = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, backoffMs));
        return this.fetchWithRetry(request, signal, attempt + 1);
      }
      throw err;
    }
  }

  private parseResult(item: unknown): MatchingResult {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Record<string, unknown>).professionalId !== 'string' ||
      typeof (item as Record<string, unknown>).score !== 'number' ||
      typeof (item as Record<string, unknown>).reasoning !== 'string' ||
      !(item as Record<string, unknown>).reasoning
    ) {
      throw new Error('AI API returned a malformed match result');
    }
    const raw = item as Record<string, unknown>;
    return {
      professionalId: raw.professionalId as string,
      score: raw.score as number,
      reasoning: raw.reasoning as string,
      modelVersion: (raw.modelVersion as string) ?? 'unknown',
    };
  }
}
