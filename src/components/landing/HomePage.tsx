import Link from 'next/link';
import { Sparkles, UserCheck, Dumbbell, Star, MapPin, Wifi } from 'lucide-react';
import { buttonVariants } from '../ui/button-variants';
import { HeroVisual } from './HeroVisual';

const loginHref = `/login?${new URLSearchParams({ callbackUrl: '/matches' }).toString()}`;

const mockProfessionals = [
  {
    name: 'Ana Martins',
    role: 'Personal Trainer',
    city: 'São Paulo, SP',
    rating: 4.9,
    reviews: 87,
    price: 'R$120–180/h',
    modality: 'Híbrido',
    initials: 'AM',
    color: 'bg-blue-500',
    specialties: ['Funcional', 'Personal'],
  },
  {
    name: 'Rafael Souza',
    role: 'Coach CrossFit',
    city: 'São Paulo, SP',
    rating: 4.7,
    reviews: 120,
    price: 'R$150–220/h',
    modality: 'Presencial',
    initials: 'RS',
    color: 'bg-orange-500',
    specialties: ['CrossFit', 'Funcional'],
  },
  {
    name: 'Carla Nogueira',
    role: 'Pilates & Reabilitação',
    city: 'Rio de Janeiro, RJ',
    rating: 4.85,
    reviews: 98,
    price: 'R$140–200/h',
    modality: 'Híbrido',
    initials: 'CN',
    color: 'bg-pink-500',
    specialties: ['Pilates', 'Reabilitação'],
  },
];

const stats = [
  { value: '6+', label: 'Professores verificados' },
  { value: '12', label: 'Especialidades' },
  { value: 'IA', label: 'Matching inteligente' },
];

export function HomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <main className="fitmatch-hero-bg flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-20">

        {/* Hero */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="size-3" aria-hidden />
              Matching com Inteligência Artificial
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                Encontre o professor{' '}
                <span className="fitmatch-text-ai">certo para você</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                A FitMatch conecta alunos a educadores físicos usando IA — levando em conta objetivos,
                orçamento, nível e modalidade preferida.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link href="/matches" className={buttonVariants({ variant: 'primary' })}>
                  Ver meus matches
                </Link>
              ) : (
                <>
                  <Link href={loginHref} className={buttonVariants({ variant: 'primary' })}>
                    Começar agora
                  </Link>
                  <Link href="/matches" className={buttonVariants({ variant: 'secondary' })}>
                    Ver matches (demo)
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 border-t border-border-subtle pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="lg:hidden">
              <HeroVisual compact />
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroVisual />
          </div>
        </div>

        {/* Role cards */}
        <section className="mt-20 sm:mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
            Como você quer usar a plataforma?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href={`/login?${new URLSearchParams({ callbackUrl: '/matches', role: 'student' }).toString()}`}
              className="group flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-7 shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand transition group-hover:bg-brand group-hover:text-white">
                <Dumbbell className="size-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sou Aluno</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receba matches personalizados com professores alinhados ao seu objetivo, orçamento
                  e modalidade preferida.
                </p>
              </div>
              <span className="mt-auto text-sm font-semibold text-brand group-hover:underline">
                Entrar como aluno →
              </span>
            </Link>

            <Link
              href={`/login?${new URLSearchParams({ callbackUrl: '/matches', role: 'professional' }).toString()}`}
              className="group flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-7 shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand transition group-hover:bg-brand group-hover:text-white">
                <UserCheck className="size-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sou Professor</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie seu perfil profissional e seja encontrado por alunos com objetivos compatíveis
                  com sua especialidade.
                </p>
              </div>
              <span className="mt-auto text-sm font-semibold text-brand group-hover:underline">
                Entrar como professor →
              </span>
            </Link>
          </div>
        </section>

        {/* Professionals preview */}
        <section className="mt-20 sm:mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Professores disponíveis
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Profissionais verificados prontos para te atender
              </p>
            </div>
            <Link
              href={loginHref}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockProfessionals.map((pro) => (
              <div
                key={pro.name}
                className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${pro.color}`}
                  >
                    {pro.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{pro.name}</p>
                    <p className="text-xs text-muted-foreground">{pro.role}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pro.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-brand"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden />
                    {pro.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="size-3" aria-hidden />
                    {pro.modality}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                    <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                    {pro.rating} ({pro.reviews})
                  </span>
                  <span className="text-xs font-semibold text-brand">{pro.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20 rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm sm:mt-24 sm:p-10">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Crie seu perfil',
                desc: 'Informe seus objetivos, nível de experiência, orçamento e modalidade preferida.',
              },
              {
                step: '02',
                title: 'IA gera os matches',
                desc: 'Nossa IA analisa professores disponíveis e cria um ranking explicado em português.',
              },
              {
                step: '03',
                title: 'Conecte-se',
                desc: 'Escolha o professor ideal e agende sua primeira sessão gratuita.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-3xl font-black text-blue-100">{item.step}</span>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
