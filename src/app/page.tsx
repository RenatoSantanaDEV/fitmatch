import { auth } from '../lib/auth';
import { HomePage } from '../components/landing/HomePage';

export default async function Home() {
  const session = await auth();
  return <HomePage isAuthenticated={!!session?.user?.id} />;
}
