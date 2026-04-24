import { NextRequest } from 'next/server';
import { registerStudentAccountUseCase } from '../../../../container';
import { registerStudentAccountSchema } from '../../../../validation/user/registerStudentAccountSchema';
import { badRequest, created, handleError } from '../../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = registerStudentAccountSchema.safeParse(body);
  if (!result.success) return badRequest(result.error.issues);

  try {
    const user = await registerStudentAccountUseCase.execute(result.data);
    return created(user);
  } catch (err) {
    return handleError(err);
  }
}
