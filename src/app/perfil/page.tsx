import { redirect } from 'next/navigation';
import type { ProfileInitialAddress } from '../../components/perfil/ProfileAddressSection';
import { PerfilContent } from '../../components/perfil/PerfilContent';
import { PerfilProfissionalContent } from '../../components/perfil/PerfilProfissionalContent';
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
  const dbUser = await userRepo.findById(session.user.id);
  const name = dbUser?.name ?? session.user.name;
  const phone = dbUser?.phone ?? null;
  const initial = (name?.trim()?.charAt(0) || email?.charAt(0) || '?').toUpperCase();

  if (role === 'PROFESSIONAL') {
    const professional = await professionalRepo.findByUserId(session.user.id);
    const initialAddress = toInitialAddress(professional?.location);

    return (
      <main className="flex min-h-0 flex-1 flex-col bg-slate-50/50">
        <PerfilProfissionalContent
          initial={initial}
          name={name ?? null}
          email={email ?? null}
          phone={phone}
          initialAddress={initialAddress}
          bio={professional?.bio ?? ''}
          crefNumber={professional?.crefNumber ?? null}
          yearsExperience={professional?.yearsExperience ?? 0}
          isAcceptingClients={professional?.isAcceptingClients ?? true}
          modalities={professional?.modalities ?? []}
          selectedAreaIds={(professional?.areas ?? []).map((a) => a.id)}
          priceMin={professional?.sessionPrice.min ?? 0}
          priceMax={professional?.sessionPrice.max ?? 0}
          locationCity={professional?.location.city ?? ''}
          locationState={professional?.location.state ?? ''}
          classDynamics={professional?.classDynamics ?? null}
          sessionDurationMinutes={professional?.sessionDurationMinutes ?? null}
        />
      </main>
    );
  }

  const student = await studentRepo.findByUserId(session.user.id);
  const initialAddress = toInitialAddress(student?.preferredLocation);

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
