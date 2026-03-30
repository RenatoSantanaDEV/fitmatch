import { NextRequest } from 'next/server';
import { submitReviewUseCase } from '../../../container';
import { submitReviewSchema } from '../../../validation/review/submitReviewSchema';
import { created, badRequest, unauthorized, handleError } from '../../../lib/apiResponse';
import { auth } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await req.json();
  const result = submitReviewSchema.safeParse(body);
  if (!result.success) return badRequest(result.error.issues);

  try {
    const review = await submitReviewUseCase.execute(session.user.id, result.data);
    return created(review);
  } catch (err) {
    return handleError(err);
  }
}
