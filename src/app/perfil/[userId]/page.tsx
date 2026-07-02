import { notFound, redirect } from 'next/navigation';
import { auth } from '../../../lib/auth';
import { getPrismaClient } from '../../../infrastructure/db/prisma/client';
import { listSimilarProfessionalsUseCase } from '../../../container';
import { ProfilePageClient } from './ProfilePageClient';
import type { ProfileData } from './ProfilePageClient';

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(
      `/?${new URLSearchParams({ auth: 'login', callbackUrl: `/perfil/${userId}` }).toString()}`,
    );
  }

  const prisma = getPrismaClient();

  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      areas: { include: { area: true } },
      certifications: { orderBy: { issueDate: 'desc' }, take: 10 },
      reviews: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          student: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
        },
      },
    },
  });

  if (!professional) notFound();

  // Check whether the current user has favorited this professional
  let isFavorited = false;
  const isOwnProfile = session.user.id === userId;

  if (!isOwnProfile) {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (student) {
      const fav = await prisma.studentFavorite.findUnique({
        where: {
          studentId_professionalId: {
            studentId: student.id,
            professionalId: professional.id,
          },
        },
      });
      isFavorited = Boolean(fav);
    }
  }

  // Proxy avatar URL through our API route if it is a raw Vercel Blob URL
  const rawAvatar = professional.user.avatarUrl ?? null;
  const avatarUrl =
    rawAvatar?.startsWith('https://') ? `/api/profile/avatar/${userId}` : rawAvatar;

  const data: ProfileData = {
    id: professional.id,
    userId: professional.userId,
    displayName: professional.user.name,
    avatarUrl,
    bio: professional.bio,
    areas: professional.areas.map((pa) => ({ id: pa.areaId, nome: pa.area.nome })),
    modalities: professional.modalities as string[],
    sessionPrice: {
      min: professional.priceMin,
      max: professional.priceMax,
      currency: professional.priceCurrency,
    },
    yearsExperience: professional.yearsExperience,
    isVerified: professional.isVerified,
    isAcceptingClients: professional.isAcceptingClients,
    averageRating: professional.averageRating,
    totalReviews: professional.totalReviews,
    city: professional.locationCity,
    state: professional.locationState,
    crefNumber: professional.crefNumber ?? null,
    classDynamics: professional.classDynamics ?? null,
    sessionDurationMinutes: professional.sessionDurationMinutes ?? null,
    certifications: professional.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuingBody: c.issuingBody,
      issueDate: c.issueDate.toISOString(),
      expiryDate: c.expiryDate?.toISOString() ?? null,
      isVerified: c.isVerified,
    })),
    reviews: professional.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.createdAt.toISOString(),
      studentName: r.student.user.name,
      studentAvatarUrl: r.student.user.avatarUrl ?? null,
    })),
  };

  const similarProfessionals = await listSimilarProfessionalsUseCase.execute({
    excludeProfessionalId: professional.id,
    specializationSlugs: professional.areas.map((pa) => pa.area.slug),
    limit: 6,
  });

  return (
    <ProfilePageClient
      data={data}
      isFavorited={isFavorited}
      isOwnProfile={isOwnProfile}
      similarProfessionals={similarProfessionals}
    />
  );
}
