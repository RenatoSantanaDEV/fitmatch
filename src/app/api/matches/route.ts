import { NextRequest } from 'next/server';
import { requestMatchUseCase } from '../../../container';
import { requestMatchSchema } from '../../../validation/match/requestMatchSchema';
import { created, badRequest, unauthorized, handleError } from '../../../lib/apiResponse';
import { auth } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await req.json();
  const result = requestMatchSchema.safeParse(body);
  if (!result.success) return badRequest(result.error.issues);

  try {
    const matches = await requestMatchUseCase.execute(session.user.id, result.data);
    return created(matches);
  } catch (err) {
    return handleError(err);
  }
}
