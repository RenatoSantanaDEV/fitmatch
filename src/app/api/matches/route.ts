import { NextRequest } from 'next/server';
import { requestMatchUseCase, listMatchesUseCase } from '../../../container';
import { requestMatchSchema } from '../../../validation/match/requestMatchSchema';
import { created, badRequest, unauthorized, ok, handleError } from '../../../lib/apiResponse';
import { auth } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const bodyRaw = await req.json().catch(() => ({}));
  const parsed = requestMatchSchema.safeParse(bodyRaw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    const matches = await requestMatchUseCase.execute(session.user.id, parsed.data);
    return created(matches);
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') ?? undefined;

  try {
    const matches = await listMatchesUseCase.execute({ userId: session.user.id, studentId });
    return ok(matches);
  } catch (err) {
    return handleError(err);
  }
}
