import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfessorStep2Profile } from '../../../components/auth/ProfessorStep2Profile';
import { auth } from '../../../lib/auth';

export const metadata: Metadata = {
  title: 'Complete seu perfil | FitMatch',
  description: 'Etapa 2: informações do seu perfil profissional.',
};

export default async function ProfessorCompletarPerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/dar-aulas');
  if (session.user.role !== 'PROFESSIONAL') redirect('/perfil');

  return (
    <ProfessorStep2Profile
      initialName={session.user.name ?? ''}
      redirectTo="/dar-aulas/completar-perfil/servicos"
    />
  );
}
