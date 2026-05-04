import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfessorStep3Services } from '../../../../components/auth/ProfessorStep3Services';
import { auth } from '../../../../lib/auth';

export const metadata: Metadata = {
  title: 'Seus serviços | FitMatch',
  description: 'Etapa 3: modalidades, especialidades e faixa de preço.',
};

export default async function ProfessorServicosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/dar-aulas');
  if (session.user.role !== 'PROFESSIONAL') redirect('/perfil');

  return <ProfessorStep3Services redirectTo="/perfil" />;
}
