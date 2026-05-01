import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '../../../../lib/auth';
import { userRepo } from '../../../../container';
import { badRequest, handleError, noContent, unauthorized } from '../../../../lib/apiResponse';

const schema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(20).nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const { name, phone } = parsed.data;

  if (name === undefined && phone === undefined) {
    return noContent();
  }

  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (phone !== undefined) patch.phone = phone ?? undefined;

  try {
    await userRepo.update(session.user.id, patch);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
