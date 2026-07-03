import { auth } from '../lib/auth';
import { HomePage } from '../components/landing/HomePage';
import type { HomeInitialLocation } from '../components/landing/homeLocationTypes';
import { listFeaturedProfessionalsUseCase, studentRepo } from '../container';
import type { ProfessionalResponseDTO } from '../application/dtos/professional/ProfessionalDTO';

export default async function Home() {
  const session = await auth();

  let featuredProfessionals: ProfessionalResponseDTO[] = [];
  try {
    featuredProfessionals = await listFeaturedProfessionalsUseCase.execute({ limit: 8 });
  } catch {
    // Silently fall back to no featured professionals
  }

  let initialLocation: HomeInitialLocation | undefined;

  if (session?.user?.id) {
    try {
      const student = await studentRepo.findByUserId(session.user.id);
      if (student?.preferredLocation) {
        initialLocation = {
          city: student.preferredLocation.city,
          state: student.preferredLocation.state,
          lat: student.preferredLocation.latitude,
          lng: student.preferredLocation.longitude,
        };
      }
    } catch {
      // Silently fall back to client-side geolocation
    }
  }

  return (
    <HomePage
      isAuthenticated={!!session?.user?.id}
      featuredProfessionals={featuredProfessionals}
      initialLocation={initialLocation}
    />
  );
}
