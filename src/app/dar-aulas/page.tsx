import type { Metadata } from 'next';
import { TeacherCommunityInvite } from '../../components/landing/TeacherCommunityInvite';

export const metadata: Metadata = {
  title: 'Dar aulas — Acesso professor | FitMatch',
  description:
    'Entre na FitMatch como educador físico ou crie sua conta profissional. Login e cadastro de professor na plataforma.',
};

export default function DarAulasPage() {
  return <TeacherCommunityInvite />;
}
