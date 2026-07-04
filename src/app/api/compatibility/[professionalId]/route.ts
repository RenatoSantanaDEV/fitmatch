import { type NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getPrismaClient } from '../../../../infrastructure/db/prisma/client';
import { ok, unauthorized, badRequest, tooManyRequests, handleError } from '../../../../lib/apiResponse';
import { checkRateLimit } from '../../../../lib/rateLimit';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_KEY_PREFIX = 'compat';

export interface StudentCompatibilityForm {
  mainGoal: string[];
  level: string;
  preferredModality: string;
  trainerStyle: string;
  frequency: string;
  emotionalGoal: string;
  restrictions: string;
}

export interface CompatibilityResult {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  notes: string[];
}

const SYSTEM_PROMPT = `Você é o Motor de Compatibilidade da IA FitMatch. Dado o perfil de um aluno e de um professor de educação física, analise a compatibilidade entre eles e retorne um JSON estruturado em português brasileiro.

Retorne EXATAMENTE este objeto JSON (sem campos extras):
{
  "score": <inteiro de 0 a 100>,
  "summary": "<2-3 frases em pt-BR, tom caloroso e humano, mencione objetivos do aluno e pontos fortes/fracos do professor>",
  "pros": ["<ponto positivo 1>", "<ponto positivo 2>", ...],
  "cons": ["<ponto de atenção 1>", ...],
  "notes": ["<dica 1>", ...]
}

Guia de pontuação:
- 85-100: Excelente compatibilidade (especialização + modalidade + nível alinhados)
- 70-84: Boa compatibilidade (maioria dos fatores alinha)
- 50-69: Compatibilidade moderada (alguns fatores alinham)
- Abaixo de 50: Compatibilidade fraca

Regras:
- score: inteiro entre 0 e 100
- summary: 2-3 frases concretas em pt-BR mencionando objetivos específicos do aluno e características do professor
- pros: 2-4 pontos positivos específicos (pt-BR)
- cons: 0-3 pontos de atenção (array vazio [] se score >= 85)
- notes: 1-3 dicas práticas para o aluno (pt-BR)
- Seja específico, nunca genérico. Referencie os dados reais do aluno e do professor.
- Não use markdown nos textos, apenas texto simples.`;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ professionalId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const rateLimit = checkRateLimit(`${RATE_KEY_PREFIX}:${session.user.id}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.ok) {
    return tooManyRequests(
      rateLimit.retryAfter,
      `Limite de análises atingido. Tente novamente em ${Math.ceil(rateLimit.retryAfter / 60)} minuto(s).`,
    );
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return badRequest('Serviço de IA indisponível.');

  const { professionalId } = await params;

  let body: StudentCompatibilityForm;
  try {
    body = (await req.json()) as StudentCompatibilityForm;
  } catch {
    return badRequest('Corpo da requisição inválido.');
  }

  if (!body.mainGoal || body.mainGoal.length === 0 || !body.level || !body.preferredModality || !body.trainerStyle || !body.frequency || !body.emotionalGoal) {
    return badRequest('Campos obrigatórios ausentes.');
  }

  try {
    const prisma = getPrismaClient();
    const baseUrl = (process.env.AI_API_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.AI_MODEL ?? 'gpt-4o-mini';

    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: { select: { name: true } },
        areas: { include: { area: true } },
      },
    });

    if (!professional) return badRequest('Profissional não encontrado.');

    const userMessage = JSON.stringify({
      aluno: {
        objetivo_principal: body.mainGoal,
        nivel: body.level,
        modalidade_preferida: body.preferredModality,
        estilo_professor_preferido: body.trainerStyle,
        frequencia_desejada: body.frequency,
        objetivo_emocional: body.emotionalGoal,
        restricoes: body.restrictions || null,
      },
      professor: {
        nome: professional.user.name,
        areas_atuacao: professional.areas.map((pa) => pa.area.nome),
        modalidades: professional.modalities,
        anos_experiencia: professional.yearsExperience,
        avaliacao_media: professional.averageRating,
        total_avaliacoes: professional.totalReviews,
        verificado: professional.isVerified,
        bio: professional.bio.slice(0, 600),
        dinamica_aula: professional.classDynamics?.slice(0, 400) ?? null,
        preco: {
          min: professional.priceMin,
          max: professional.priceMax,
          moeda: professional.priceCurrency,
        },
      },
    });

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'compatibility_result',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['score', 'summary', 'pros', 'cons', 'notes'],
              properties: {
                score: { type: 'integer', minimum: 0, maximum: 100 },
                summary: { type: 'string', minLength: 20 },
                pros: { type: 'array', items: { type: 'string' } },
                cons: { type: 'array', items: { type: 'string' } },
                notes: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text().catch(() => '');
      console.error(`[Compatibility] AI API ${aiResponse.status}: ${errBody.slice(0, 200)}`);
      return badRequest('Serviço de IA retornou um erro. Tente novamente.');
    }

    const aiData = (await aiResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) return badRequest('IA não retornou conteúdo.');

    const parsed = JSON.parse(content) as CompatibilityResult;
    return ok({ ...parsed, score: Math.min(100, Math.max(0, Math.round(parsed.score))) });
  } catch (err) {
    return handleError(err);
  }
}
