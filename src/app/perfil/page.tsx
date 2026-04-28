import { redirect } from 'next/navigation';
import type { ProfileInitialAddress } from '../../components/perfil/ProfileAddressSection';
import { PerfilContent } from '../../components/perfil/PerfilContent';
import { professionalRepo, studentRepo } from '../../container';
import { auth } from '../../lib/auth';

function toInitialAddress(
  loc:
    | {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        latitude?: number;
        longitude?: number;
      }
    | undefined,
): ProfileInitialAddress | null {
  if (!loc?.city) return null;
  return {
    street: loc.street,
    city: loc.city,
    state: loc.state,
    country: loc.country,
    postalCode: loc.postalCode,
    latitude: loc.latitude ?? null,
    longitude: loc.longitude ?? null,
  };
}

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/perfil' }).toString()}`);
  }

  const { name, email, role } = session.user;
  const initial = (name?.trim()?.charAt(0) || email?.charAt(0) || '?').toUpperCase();

  let initialAddress: ProfileInitialAddress | null = null;
  if (role === 'PROFESSIONAL') {
    const professional = await professionalRepo.findByUserId(session.user.id);
    if (professional) initialAddress = toInitialAddress(professional.location);
  } else {
    const student = await studentRepo.findByUserId(session.user.id);
    if (student?.preferredLocation) initialAddress = toInitialAddress(student.preferredLocation);
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-slate-50/50">
      <PerfilContent
        initial={initial}
        initialAddress={initialAddress}
        name={name}
        email={email}
        role={role}
      />
    </main>
  );
}
