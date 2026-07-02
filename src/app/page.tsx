import { auth } from '../lib/auth';
import { HomePage } from '../components/landing/HomePage';
import { listFeaturedProfessionalsUseCase } from '../container';
import type { ProfessionalResponseDTO } from '../application/dtos/professional/ProfessionalDTO';

export default async function Home() {
  const session = await auth();

  let featuredProfessionals: ProfessionalResponseDTO[] = [];
  try {
    featuredProfessionals = await listFeaturedProfessionalsUseCase.execute({ limit: 8 });
  } catch {
    // Silently fall back to no featured professionals
  }

  return (
    <HomePage isAuthenticated={!!session?.user?.id} featuredProfessionals={featuredProfessionals} />
  );
}
