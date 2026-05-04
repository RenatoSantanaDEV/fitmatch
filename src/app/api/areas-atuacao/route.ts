import { NextResponse } from 'next/server';
import { getPrismaClient } from '../../../infrastructure/db/prisma/client';

const prisma = getPrismaClient();

export async function GET() {
  const areas = await prisma.areaAtuacao.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
    select: { id: true, nome: true, slug: true },
  });
  return NextResponse.json(areas);
}
