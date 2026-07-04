import { listFavoriteProfessionalsUseCase, studentRepo } from '../../../../container';
import { ok, handleError, unauthorized } from '../../../../lib/apiResponse';
import { auth } from '../../../../lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const student = await studentRepo.findByUserId(session.user.id);
    if (!student) return ok({ data: [] });
    const data = await listFavoriteProfessionalsUseCase.execute({ studentId: student.id });
    return ok({ data });
  } catch (err) {
    return handleError(err);
  }
}
