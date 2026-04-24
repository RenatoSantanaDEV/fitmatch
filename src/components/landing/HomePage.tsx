import Link from 'next/link';
import { Star, MapPin, CheckCircle, ArrowRight, Zap, Shield, MessageSquare } from 'lucide-react';
import { HeroVisual } from './HeroVisual';

const loginHref = `/login?${new URLSearchParams({ callbackUrl: '/matches' }).toString()}`;

const mockProfessionals = [
  {
    name: 'Ana Martins',
    role: 'Personal Trainer',
    city: 'São Paulo, SP',
    rating: 4.9,
    reviews: 87,
    price: 'R$ 120–180/h',
    modality: 'Híbrido',
    initials: 'AM',
    color: '#2563eb',
    specialties: ['Funcional', 'Personal'],
    verified: true,
  },
  {
    name: 'Rafael Souza',
    role: 'Coach CrossFit',
    city: 'São Paulo, SP',
    rating: 4.7,
    reviews: 120,
    price: 'R$ 150–220/h',
    modality: 'Presencial',
    initials: 'RS',
    color: '#ea580c',
    specialties: ['CrossFit', 'Funcional'],
    verified: true,
  },
  {
    name: 'Carla Nogueira',
    role: 'Pilates & Reabilitação',
    city: 'Rio de Janeiro, RJ',
    rating: 4.85,
    reviews: 98,
    price: 'R$ 140–200/h',
    modality: 'Híbrido',
    initials: 'CN',
    color: '#db2777',
    specialties: ['Pilates', 'Reabilitação'],
    verified: true,
  },
];

const howItWorks = [
  {
    icon: <Shield className="size-5" aria-hidden />,
    title: 'Crie seu perfil',
    desc: 'Informe objetivos, nível, orçamento e modalidade preferida (presencial, online ou híbrido).',
  },
  {
    icon: <Zap className="size-5" aria-hidden />,
    title: 'IA faz o match',
    desc: 'Nossa IA analisa professores disponíveis e gera um ranking personalizado e explicado.',
  },
  {
    icon: <MessageSquare className="size-5" aria-hidden />,
    title: 'Conecte-se',
    desc: 'Escolha o professor ideal e agende sua primeira sessão gratuita diretamente pela plataforma.',
  },
];

export function HomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <main className="flex flex-1 flex-col bg-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="fitmatch-hero-bg">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 pt-20 pb-24 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:pt-24 lg:pb-28">

          {/* Left */}
          <div className="flex flex-1 flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              Plataforma de matching com IA
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
              Encontre o professor{' '}
              <span className="fitmatch-text-ai">certo para você</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-slate-500">
              A FitMatch usa inteligência artificial para conectar alunos a educadores físicos
              compatíveis — com ranking explicado em português.
            </p>

            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link
                  href="/matches"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Ver meus matches
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <>
                  <Link
                    href={loginHref}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Começar grátis
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href="/matches"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Ver demo
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900">6+</span>
                <span className="text-xs text-slate-400">Professores verificados</span>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900">12</span>
                <span className="text-xs text-slate-400">Especialidades</span>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-blue-600">IA</span>
                <span className="text-xs text-slate-400">Matching inteligente</span>
              </div>
            </div>
          </div>

          {/* Right — match preview */}
          <div className="w-full lg:max-w-sm xl:max-w-md">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── Role cards ───────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-slate-900">
            Como você quer usar a plataforma?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <Link
              href={`/login?${new URLSearchParams({ callbackUrl: '/matches', role: 'student' }).toString()}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-50 transition group-hover:bg-blue-100" />
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                    <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Sou Aluno</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Receba matches personalizados com professores alinhados ao seu objetivo,
                  orçamento e modalidade preferida.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                  Entrar como aluno
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </Link>

            <Link
              href={`/login?${new URLSearchParams({ callbackUrl: '/matches', role: 'professional' }).toString()}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-violet-50 transition group-hover:bg-violet-100" />
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Sou Professor</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Crie seu perfil profissional e seja encontrado por alunos com objetivos
                  compatíveis com sua especialidade.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 group-hover:gap-2.5 transition-all">
                  Entrar como professor
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Professionals ────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
                Na plataforma
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Professores disponíveis
              </h2>
            </div>
            <Link
              href={loginHref}
              className="hidden items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline sm:inline-flex"
            >
              Ver todos
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mockProfessionals.map((pro) => (
              <article
                key={pro.name}
                className="group flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-blue-100 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white"
                    style={{ backgroundColor: pro.color }}
                  >
                    {pro.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-bold text-slate-900">{pro.name}</p>
                      {pro.verified && (
                        <CheckCircle className="size-4 shrink-0 text-blue-500" aria-label="Verificado" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{pro.role}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pro.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden />
                    {pro.city}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {pro.modality}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="font-bold text-slate-800">{pro.rating}</span>
                    <span className="text-slate-400">({pro.reviews})</span>
                  </span>
                  <span className="text-sm font-bold text-slate-900">{pro.price}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
            >
              Ver todos os professores <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
              Simples assim
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Como funciona
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {howItWorks.map((item, i) => (
              <div key={item.title} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <div className="h-px flex-1 bg-slate-700" />
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-blue-400">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Pronto para encontrar seu professor?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
            Crie sua conta gratuitamente e receba matches personalizados em minutos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Criar conta grátis
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
