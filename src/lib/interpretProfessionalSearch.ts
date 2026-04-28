import { SpecializationType } from '../domain/enums/SpecializationType';
import { SessionModality } from '../domain/enums/SessionModality';

export type InterpretedProfessionalSearch = {
  specializations: SpecializationType[];
  modalities: SessionModality[];
  city?: string;
  state?: string;
  summary: string;
};

const SPEC_PATTERNS: { pattern: RegExp; value: SpecializationType }[] = [
  { pattern: /\b(personal|funcional|muscula[cç][aã]o)\b/i, value: SpecializationType.PERSONAL_TRAINING },
  { pattern: /\b(yoga)\b/i, value: SpecializationType.YOGA },
  { pattern: /\b(pilates)\b/i, value: SpecializationType.PILATES },
  { pattern: /\b(lutas?|muay|boxe|jiu|mma|artes marciais)\b/i, value: SpecializationType.MARTIAL_ARTS },
  { pattern: /\b(cross\s*fit|crossfit)\b/i, value: SpecializationType.CROSSFIT },
  { pattern: /\b(nata[cç][aã]o|swim)\b/i, value: SpecializationType.SWIMMING },
  { pattern: /\b(nutri[cç][aã]o|nutricionista)\b/i, value: SpecializationType.NUTRITION_COACHING },
  { pattern: /\b(dan[cç]a|dance)\b/i, value: SpecializationType.DANCE },
  { pattern: /\b(ciclismo|bike)\b/i, value: SpecializationType.CYCLING },
  { pattern: /\b(reabilita[cç][aã]o|fisio)\b/i, value: SpecializationType.REHABILITATION },
  { pattern: /\b(medita[cç][aã]o|mindfulness)\b/i, value: SpecializationType.MEDITATION },
];

function heuristicInterpret(
  query: string,
  cityHint?: string | null,
  stateHint?: string | null,
): InterpretedProfessionalSearch {
  const q = query.trim();
  const specs = new Set<SpecializationType>();
  for (const { pattern, value } of SPEC_PATTERNS) {
    if (pattern.test(q)) specs.add(value);
  }
  const modalities: SessionModality[] = [];
  if (/\b(online|remot[oa]|zoom|meet|video)\b/i.test(q)) modalities.push(SessionModality.ONLINE);
  if (/\b(presencial|domic[ií]lio|em casa|local)\b/i.test(q)) modalities.push(SessionModality.IN_PERSON);
  if (/\b(h[ií]brido|hibrido|misto)\b/i.test(q)) modalities.push(SessionModality.HYBRID);

  const parts: string[] = [];
  if (specs.size) parts.push(`Especialidades: ${[...specs].join(', ')}`);
  if (modalities.length) parts.push(`Modalidade: ${modalities.join(', ')}`);
  if (!parts.length) parts.push('Busca por texto livre (sem palavras-chave específicas)');

  return {
    specializations: [...specs],
    modalities,
    city: cityHint?.trim() || undefined,
    state: stateHint?.trim() || undefined,
    summary: parts.join(' · '),
  };
}

async function llmInterpret(
  query: string,
  cityHint?: string | null,
  stateHint?: string | null,
): Promise<InterpretedProfessionalSearch | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || query.trim().length < 2) return null;

  const baseUrl = process.env.AI_API_BASE_URL ?? 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini';

  const allowedSpecs = Object.values(SpecializationType);
  const allowedMods = Object.values(SessionModality);

  const system = `És um assistente que extrai filtros de busca de educação física em PT-BR.
Responde APENAS JSON válido com chaves: specializations (array de strings do conjunto permitido), modalities (array), city (string ou null), state (string UF 2 letras ou null), summary (string curta em PT).
Valores permitidos specializations: ${allowedSpecs.join(', ')}.
Valores permitidos modalities: ${allowedMods.join(', ')}.
Se não tiveres a certeza, usa listas vazias.`;

  const user = `Texto do utilizador: ${query}\nCidade sugerida: ${cityHint ?? ''}\nEstado (UF) sugerido: ${stateHint ?? ''}`;

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  const specs = Array.isArray(o.specializations)
    ? (o.specializations.filter((x): x is SpecializationType =>
        typeof x === 'string' && (allowedSpecs as string[]).includes(x),
      ) as SpecializationType[])
    : [];
  const mods = Array.isArray(o.modalities)
    ? (o.modalities.filter((x): x is SessionModality =>
        typeof x === 'string' && (allowedMods as string[]).includes(x),
      ) as SessionModality[])
    : [];
  const city = typeof o.city === 'string' ? o.city.trim() || undefined : undefined;
  const state = typeof o.state === 'string' ? o.state.trim().toUpperCase().slice(0, 2) : undefined;
  const summary = typeof o.summary === 'string' ? o.summary : 'Interpretação por IA';

  return {
    specializations: specs,
    modalities: mods,
    city: city ?? (cityHint?.trim() ? cityHint.trim() : undefined),
    state: state ?? (stateHint?.trim() ? stateHint.trim().toUpperCase().slice(0, 2) : undefined),
    summary,
  };
}

/**
 * Interpreta texto livre (e opcionalmente cidade/UF) para filtros de listagem.
 * Com `AI_API_KEY` tenta LLM; caso contrário usa heurísticas locais.
 */
export async function interpretProfessionalSearch(
  query: string,
  cityHint?: string | null,
  stateHint?: string | null,
): Promise<InterpretedProfessionalSearch> {
  const fromLlm = await llmInterpret(query, cityHint, stateHint);
  if (fromLlm) {
    const heur = heuristicInterpret(query, cityHint, stateHint);
    return {
      specializations: fromLlm.specializations.length ? fromLlm.specializations : heur.specializations,
      modalities: fromLlm.modalities.length ? fromLlm.modalities : heur.modalities,
      city: fromLlm.city ?? heur.city,
      state: fromLlm.state ?? heur.state,
      summary: fromLlm.summary,
    };
  }
  return heuristicInterpret(query, cityHint, stateHint);
}
