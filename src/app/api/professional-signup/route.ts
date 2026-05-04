import { NextRequest } from 'next/server';
import { registerProfessionalAccountUseCase } from '../../../container';
import { registerProfessionalCredentialsSchema } from '../../../validation/user/registerProfessionalCredentialsSchema';
import { badRequest, created, handleError } from '../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = registerProfessionalCredentialsSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    const user = await registerProfessionalAccountUseCase.execute(parsed.data);
    return created(user);
  } catch (err) {
    return handleError(err);
  }
}
