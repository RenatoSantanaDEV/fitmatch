import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { unauthorized, forbidden } from '../../../../lib/apiResponse';

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

const rl = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rl.get(userId);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    rl.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: LIMIT - 1, resetAt };
  }
  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: LIMIT - entry.count, resetAt: entry.resetAt };
}

const PROMPTS = {
  bio: 'Melhore esta apresentação profissional de um professor de fitness para ser mais atrativa e convincente para potenciais alunos.',
  classDynamics:
    'Melhore esta descrição de como são as aulas deste professor de fitness, tornando-a mais clara e atrativa para potenciais alunos.',
} as const;

const SYSTEM_PROMPT = `Você é um especialista em marketing pessoal para profissionais de fitness no Brasil.
Regras obrigatórias:
- Escreva em português do Brasil
- Mantenha o tom pessoal e autêntico do texto original
- Remova qualquer informação de contato: telefone, e-mail, redes sociais, @handles, endereços, links
- Máximo de 500 palavras
- Não invente informações que não estavam no original
- Retorne apenas o texto melhorado, sem explicações ou comentários adicionais`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_API_BASE_URL ?? 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Melhoria por IA não está configurada neste ambiente.' },
      { status: 503 },
    );
  }

  const { allowed, remaining, resetAt } = checkRateLimit(session.user.id);
  if (!allowed) {
    const minutesLeft = Math.ceil((resetAt - Date.now()) / 60_000);
    return NextResponse.json(
      { error: `Limite de melhorias atingido. Tente novamente em ${minutesLeft} min.` },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          'Retry-After': String(minutesLeft * 60),
        },
      },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { text?: string; type?: string };
  const { text, type } = body;

  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return NextResponse.json(
      { error: 'Texto muito curto para melhorar. Escreva pelo menos 20 caracteres.' },
      { status: 400 },
    );
  }

  const taskPrompt = PROMPTS[type as keyof typeof PROMPTS] ?? PROMPTS.bio;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${taskPrompt}\n\nTexto original:\n${text.trim()}` },
        ],
        temperature: 0.7,
        max_tokens: 700,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Serviço de IA indisponível. Tente novamente.' },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const improved = data.choices?.[0]?.message?.content?.trim();

    if (!improved) {
      return NextResponse.json(
        { error: 'A IA não retornou um resultado válido.' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { improved, remaining },
      {
        headers: {
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'Erro ao conectar ao serviço de IA.' }, { status: 502 });
  }
}
