'use client';

import Link from 'next/link';
import { Star, MapPin, CheckCircle, ArrowRight, Zap, Shield, MessageSquare } from 'lucide-react';
import { OpenAuthModal } from '../auth/OpenAuthModal';
import { FindTeacherSearchPanel } from './FindTeacherSearchPanel';
import { HeroVisual } from './HeroVisual';

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
    color: 'from-blue-500 to-blue-600',
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
    color: 'from-orange-500 to-orange-600',
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
    color: 'from-pink-500 to-rose-500',
    specialties: ['Pilates', 'Reabilitação'],
    verified: true,
  },
];

const howItWorks = [
  {
    icon: <Shield className="size-6" aria-hidden />,
    step: '01',
    title: 'Crie seu perfil',
    desc: 'Informe objetivos, nível, orçamento e modalidade preferida.',
  },
  {
    icon: <Zap className="size-6" aria-hidden />,
    step: '02',
    title: 'IA gera o ranking',
    desc: 'Nossa IA analisa professores e monta um ranking explicado em português.',
  },
  {
    icon: <MessageSquare className="size-6" aria-hidden />,
    step: '03',
    title: 'Conecte-se',
    desc: 'Escolha o professor ideal e agende sua primeira sessão gratuita.',
  },
];

export function HomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <main className="flex flex-1 flex-col bg-white">

      <section className="bg-blue-600">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:py-20">

          <div className="flex flex-1 flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-500/60 px-4 py-1.5 text-sm font-semibold text-blue-100 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-200" />
              Indicações com inteligência artificial
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Encontre o professor{' '}
              <span className="text-blue-200">certo para você</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-blue-100">
              A FitMatch usa inteligência artificial para conectar alunos a educadores físicos
              compatíveis — com ranking explicado em português.
            </p>

            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <FindTeacherSearchPanel />
              ) : (
                <>
                  <OpenAuthModal
                    mode="login"
                    callbackUrl="/recomendacoes"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-blue-600 shadow-lg transition hover:bg-blue-50 active:scale-[0.98]"
                  >
                    Começar grátis
                    <ArrowRight className="size-4" aria-hidden />
                  </OpenAuthModal>
                  <Link
                    href="/recomendacoes"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-400 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Ver recomendações
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-8 border-t border-blue-500 pt-6">
              {[
                { value: '6+', label: 'Professores verificados' },
                { value: '12', label: 'Especialidades' },
                { value: '100%', label: 'Gratuito para alunos' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-blue-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:max-w-[360px]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {!isAuthenticated ? (
      <section className="border-b border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-2 text-center text-3xl font-black tracking-tight text-slate-900">
            Como você quer usar a plataforma?
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Escolha seu papel e entre diretamente
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <OpenAuthModal
              mode="login"
              role="student"
              callbackUrl="/recomendacoes"
              className="group relative flex w-full flex-col gap-5 overflow-hidden rounded-2xl border-2 border-blue-100 bg-white p-8 text-left shadow-sm transition hover:border-blue-400 hover:shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-50 transition group-hover:bg-blue-100" />
              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
                    <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900">Sou Aluno</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Receba uma lista personalizada de professores alinhados ao seu objetivo,
                  orçamento e modalidade preferida.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all group-hover:gap-3">
                  Entrar como aluno <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </OpenAuthModal>

            <OpenAuthModal
              mode="login"
              role="professional"
              callbackUrl="/recomendacoes"
              className="group relative flex w-full flex-col gap-5 overflow-hidden rounded-2xl border-2 border-violet-100 bg-white p-8 text-left shadow-sm transition hover:border-violet-400 hover:shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-violet-50 transition group-hover:bg-violet-100" />
              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200">
                  <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900">Sou Professor</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Crie seu perfil profissional e seja encontrado por alunos com objetivos
                  compatíveis com sua especialidade.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 transition-all group-hover:gap-3">
                  Entrar como professor <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </OpenAuthModal>
          </div>
        </div>
      </section>
      ) : null}

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Na plataforma agora
              </span>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
                Professores disponíveis
              </h2>
            </div>
            {isAuthenticated ? (
              <Link
                href="/descobrir"
                className="hidden items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline sm:inline-flex"
              >
                Buscar professores <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <OpenAuthModal
                mode="login"
                callbackUrl="/recomendacoes"
                className="hidden items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline sm:inline-flex"
              >
                Ver todos <ArrowRight className="size-3.5" aria-hidden />
              </OpenAuthModal>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mockProfessionals.map((pro) => (
              <article
                key={pro.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className={`bg-gradient-to-r ${pro.color} flex items-center gap-4 px-6 py-5`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-black text-white backdrop-blur-sm">
                    {pro.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-white">{pro.name}</p>
                      {pro.verified && (
                        <CheckCircle className="size-4 shrink-0 text-white/80" aria-label="Verificado" />
                      )}
                    </div>
                    <p className="text-sm text-white/80">{pro.role}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {pro.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-semibold text-slate-600"
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
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                      {pro.modality}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      <span className="font-bold text-slate-800">{pro.rating}</span>
                      <span className="text-slate-400">({pro.reviews})</span>
                    </span>
                    <span className="text-sm font-black text-slate-900">{pro.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Simples assim
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Como funciona
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {howItWorks.map((item, i) => (
              <div key={item.title} className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-900">
                    {item.step}
                  </span>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent sm:block" />
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-blue-400">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ajuda-fitmatch" className="border-b border-slate-100 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Precisa de ajuda para começar?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Use <strong className="text-slate-800">Procurar</strong> para filtrar por cidade e
            especialidade. Em <strong className="text-slate-800">Recomendações</strong>, a IA monta
            uma lista ordenada por afinidade com o seu perfil — sempre com texto claro em
            português.
          </p>
        </div>
      </section>

      <section className="bg-blue-600 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Continue a explorar professores
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-200">
                Ajuste preferências na sua conta e veja o ranking gerado para você.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/descobrir"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-blue-600 shadow-xl shadow-blue-800/30 transition hover:bg-blue-50 active:scale-[0.98]"
                >
                  Encontrar professor
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/perfil"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-300 px-8 py-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Conta e perfil
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Pronto para encontrar seu professor?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-200">
                Crie sua conta gratuitamente e receba recomendações personalizadas em minutos.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <OpenAuthModal
                  mode="register"
                  callbackUrl="/recomendacoes"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-blue-600 shadow-xl shadow-blue-800/30 transition hover:bg-blue-50 active:scale-[0.98]"
                >
                  Criar conta grátis
                  <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
              </div>
            </>
          )}
        </div>
      </section>

    </main>
  );
}
