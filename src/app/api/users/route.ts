import { NextRequest } from 'next/server';
import { registerUserUseCase } from '../../../container';
import { registerUserSchema } from '../../../validation/user/registerUserSchema';
import { created, badRequest, handleError } from '../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = registerUserSchema.safeParse(body);
  if (!result.success) return badRequest(result.error.issues);

  try {
    const user = await registerUserUseCase.execute(result.data);
    return created(user);
  } catch (err) {
    return handleError(err);
  }
}
