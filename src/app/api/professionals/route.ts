import { NextRequest } from 'next/server';
import { listProfessionalsUseCase } from '../../../container';
import { paginationSchema } from '../../../validation/shared';
import { SpecializationType } from '../../../domain/enums/SpecializationType';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { ok, handleError } from '../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const paginationResult = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });

  if (!paginationResult.success) {
    return ok({ error: paginationResult.error.issues }, 400);
  }

  try {
    const result = await listProfessionalsUseCase.execute({
      city: searchParams.get('city') ?? undefined,
      state: searchParams.get('state') ?? undefined,
      specializations: searchParams.getAll('specialization') as SpecializationType[],
      modalities: searchParams.getAll('modality') as SessionModality[],
      maxPriceInCents: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      page: paginationResult.data.page,
      limit: paginationResult.data.limit,
    });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
