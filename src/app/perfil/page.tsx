import { redirect } from 'next/navigation';
import type { ProfileInitialAddress } from '../../components/perfil/ProfileAddressSection';
import { PerfilContent } from '../../components/perfil/PerfilContent';
import { professionalRepo, studentRepo, userRepo } from '../../container';
import { auth } from '../../lib/auth';

function toInitialAddress(
  loc:
    | {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
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
  };
}

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/perfil' }).toString()}`);
  }

  const { email, role } = session.user;

  const [dbUser, locationData] = await Promise.all([
    userRepo.findById(session.user.id),
    role === 'PROFESSIONAL'
      ? professionalRepo.findByUserId(session.user.id).then((p) => p?.location)
      : studentRepo.findByUserId(session.user.id).then((s) => s?.preferredLocation),
  ]);

  const name = dbUser?.name ?? session.user.name;
  const phone = dbUser?.phone ?? null;
  const initial = (name?.trim()?.charAt(0) || email?.charAt(0) || '?').toUpperCase();
  const initialAddress = toInitialAddress(locationData);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-slate-50/50">
      <PerfilContent
        initial={initial}
        initialAddress={initialAddress}
        name={name ?? null}
        email={email ?? null}
        role={role ?? null}
        phone={phone}
      />
    </main>
  );
}
