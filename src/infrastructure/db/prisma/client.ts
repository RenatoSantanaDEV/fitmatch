import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const baseUrl = process.env.POSTGRES_PRISMA_URL ?? '';
    // pgBouncer handles connection pooling — keep Prisma's own pool small
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = `${baseUrl}${separator}connection_limit=3&pool_timeout=30`;

    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: { db: { url } },
    });
  }
  return globalForPrisma.prisma;
}
