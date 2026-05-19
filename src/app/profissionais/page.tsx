'use server';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../../lib/auth';
import { studentRepo } from '../../container';
import { ProfissionaisClient } from './ProfissionaisClient';

export default async function ProfissionaisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; modality?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/profissionais' }).toString()}`);
  }

  const { q, modality } = await searchParams;

  let defaultCity: string | undefined;
  let defaultState: string | undefined;
  try {
    const student = await studentRepo.findByUserId(session.user.id);
    if (student?.preferredLocation?.city) {
      defaultCity = student.preferredLocation.city;
      defaultState = student.preferredLocation.state;
    }
  } catch {
    // fall back to no location
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProfissionaisClient
        initialQuery={q ?? ''}
        initialModality={modality ?? ''}
        defaultCity={defaultCity}
        defaultState={defaultState}
      />
    </Suspense>
  );
}
