import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '../../../../../lib/auth';
import { getPrismaClient } from '../../../../../infrastructure/db/prisma/client';

const prisma = getPrismaClient();
import {
  badRequest,
  created,
  forbidden,
  handleError,
  ok,
  unauthorized,
} from '../../../../../lib/apiResponse';

const createSchema = z.object({
  name: z.string().min(2).max(120),
  issuingBody: z.string().min(2).max(120),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!professional) return ok([]);

    const certs = await prisma.certification.findMany({
      where: { professionalId: professional.id },
      orderBy: { issueDate: 'desc' },
      select: {
        id: true,
        name: true,
        issuingBody: true,
        issueDate: true,
        expiryDate: true,
        documentUrl: true,
        isVerified: true,
      },
    });

    // Replace stored blob URLs with proxy URLs that serve signed download links
    const mapped = certs.map((c) => ({
      ...c,
      documentUrl: c.documentUrl?.includes('vercel-storage.com')
        ? `/api/profile/professional/certificates/${c.id}/document/view`
        : c.documentUrl,
    }));
    return ok(mapped);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const raw = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const { name, issuingBody, issueDate, expiryDate } = parsed.data;

  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!professional) return forbidden();

    const cert = await prisma.certification.create({
      data: {
        professionalId: professional.id,
        name,
        issuingBody,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      select: {
        id: true,
        name: true,
        issuingBody: true,
        issueDate: true,
        expiryDate: true,
        documentUrl: true,
        isVerified: true,
      },
    });
    return created(cert);
  } catch (err) {
    return handleError(err);
  }
}
