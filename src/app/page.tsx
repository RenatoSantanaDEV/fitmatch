import { auth } from '../lib/auth';
import { HomePage } from '../components/landing/HomePage';
import type { FeaturedProfessional } from '../components/landing/HomePage';
import { listProfessionalsUseCase } from '../container';

export default async function Home() {
  const session = await auth();

  let featuredProfessional: FeaturedProfessional | null = null;
  try {
    const { data } = await listProfessionalsUseCase.execute({ page: 1, limit: 1 });
    const top = data[0];
    if (top) {
      featuredProfessional = {
        userId: top.userId,
        displayName: top.displayName,
        avatarUrl: top.avatarUrl,
        areas: top.areas,
        location: { city: top.location.city, state: top.location.state },
        modalities: top.modalities,
        sessionPrice: top.sessionPrice,
        isVerified: top.isVerified,
        averageRating: top.averageRating,
        totalReviews: top.totalReviews,
      };
    }
  } catch {
    // Silently fall back to no featured professional
  }

  return (
    <HomePage isAuthenticated={!!session?.user?.id} featuredProfessional={featuredProfessional} />
  );
}
