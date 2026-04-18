import { IMatchingPort } from '../../application/ports/output/IMatchingPort';
import { HeuristicMatchingAdapter } from './HeuristicMatchingAdapter';
import { LLMMatchingAdapter } from './LLMMatchingAdapter';

/**
 * Picks the matching adapter at runtime:
 *
 * - `AI_API_KEY` present (and `AI_PROVIDER` != "heuristic") → `LLMMatchingAdapter`
 *   pointing at any OpenAI-compatible endpoint (OpenAI, xAI Grok, Groq...).
 * - Otherwise (or `AI_PROVIDER=heuristic`) → `HeuristicMatchingAdapter`.
 *
 * Keeping the decision in one place means use cases never touch env vars
 * and swapping providers in deploy is a pure configuration change.
 */
export class MatchingAdapterFactory {
  static create(): IMatchingPort {
    const provider = (process.env.AI_PROVIDER ?? '').toLowerCase();
    const apiKey = process.env.AI_API_KEY;

    if (provider === 'heuristic' || !apiKey) {
      if (process.env.NODE_ENV !== 'test') {
        console.info(
          '[MatchingAdapterFactory] Using HeuristicMatchingAdapter (no AI_API_KEY set or AI_PROVIDER=heuristic).',
        );
      }
      return new HeuristicMatchingAdapter();
    }

    return new LLMMatchingAdapter();
  }
}
