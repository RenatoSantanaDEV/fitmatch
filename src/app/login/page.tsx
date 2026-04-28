import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  qs.set('auth', 'login');
  if (sp.callbackUrl) qs.set('callbackUrl', sp.callbackUrl);
  if (sp.role) qs.set('role', sp.role);
  redirect(`/?${qs.toString()}`);
}
