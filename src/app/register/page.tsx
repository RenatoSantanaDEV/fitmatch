import { redirect } from 'next/navigation';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  qs.set('auth', 'register');
  if (sp.callbackUrl) qs.set('callbackUrl', sp.callbackUrl);
  redirect(`/?${qs.toString()}`);
}
