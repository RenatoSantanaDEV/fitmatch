import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { studentRepo } from '../../container';
import { DiscoverClient } from './DiscoverClient';
import { DiscoverPageSpinner } from './loading';

export default async function DescobrirPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/descobrir' }).toString()}`);
  }

  let defaultCity: string | undefined;
  let defaultState: string | undefined;

  try {
    const student = await studentRepo.findByUserId(session.user.id);
    if (student?.preferredLocation?.city) {
      defaultCity = student.preferredLocation.city;
      defaultState = student.preferredLocation.state;
    }
  } catch {
    // Silently fall back to no location filter
  }

  return (
    <>
      <noscript>
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          Ative JavaScript para usar a busca.
        </div>
      </noscript>
      <Suspense fallback={<DiscoverPageSpinner />}>
        <DiscoverClient defaultCity={defaultCity} defaultState={defaultState} />
      </Suspense>
    </>
  );
}
