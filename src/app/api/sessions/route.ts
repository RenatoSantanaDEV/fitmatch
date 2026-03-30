import { NextRequest } from 'next/server';
import { bookSessionUseCase } from '../../../container';
import { bookSessionSchema } from '../../../validation/session/bookSessionSchema';
import { created, badRequest, unauthorized, handleError } from '../../../lib/apiResponse';
import { auth } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await req.json();
  const result = bookSessionSchema.safeParse(body);
  if (!result.success) return badRequest(result.error.issues);

  try {
    const booked = await bookSessionUseCase.execute(session.user.id, result.data);
    return created(booked);
  } catch (err) {
    return handleError(err);
  }
}
