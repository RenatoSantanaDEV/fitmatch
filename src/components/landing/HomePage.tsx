'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  Shield,
  MessageSquare,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { OpenAuthModal } from '../auth/OpenAuthModal';
import { FindTeacherSearchPanel } from './FindTeacherSearchPanel';
import { HomeProfessionalsShowcase } from './HomeProfessionalsShowcase';
import type { HomeInitialLocation } from './homeLocationTypes';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';

const howItWorks = [
  {
    icon: Shield,
    step: '01',
    title: 'Crie seu perfil',
    desc: 'Informe seus objetivos, nível de condicionamento, modalidade preferida e orçamento disponível.',
    iconClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Zap,
    step: '02',
    title: 'Receba seu ranking',
    desc: 'Nossa plataforma analisa todos os professores cadastrados e monta um ranking com explicações em português.',
    iconClass: 'bg-violet-100 text-violet-700',
  },
  {
    icon: MessageSquare,
    step: '03',
    title: 'Conecte-se',
    desc: 'Escolha o professor ideal e inicie sua jornada com uma primeira sessão gratuita.',
    iconClass: 'bg-emerald-100 text-emerald-700',
  },
];

export function HomePage({
  isAuthenticated,
  featuredProfessionals,
  initialLocation,
}: {
  isAuthenticated: boolean;
  featuredProfessionals: ProfessionalResponseDTO[];
  initialLocation?: HomeInitialLocation;
}) {
  return (
    <main className="flex flex-1 flex-col bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-7 px-6 py-16 lg:px-10 lg:py-24">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
            Encontre o professor de{' '}
            educação física{' '}
            <span className="text-emerald-600">certo para você</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-slate-500">
            A FitMatch conecta alunos a educadores físicos verificados com base em seus objetivos,
            localização e disponibilidade.
          </p>

          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? (
              <FindTeacherSearchPanel />
            ) : (
              <>
                <OpenAuthModal
                  mode="register"
                  callbackUrl="/descobrir"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                >
                  Começar grátis
                  <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
                <OpenAuthModal
                  mode="login"
                  callbackUrl="/descobrir"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                >
                  Já tenho conta
                </OpenAuthModal>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-8 pt-6">
            {[
              { value: '50+', label: 'Professores verificados' },
              { value: '12', label: 'Especialidades' },
              { value: '100%', label: 'Grátis para alunos' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-emerald-600">{s.value}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSORES — destaque principal */}
      <HomeProfessionalsShowcase
        featuredProfessionals={featuredProfessionals}
        initialLocation={initialLocation}
        isAuthenticated={isAuthenticated}
      />

      {/* ROLE SELECTION (unauthenticated only) */}
      {!isAuthenticated && (
        <section className="border-b border-slate-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Para você
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                Como você quer usar a plataforma?
              </h2>
              <p className="mt-2 text-slate-500">Escolha seu papel e comece agora mesmo</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <OpenAuthModal
                mode="login"
                callbackUrl="/descobrir"
                className="flex w-full cursor-pointer flex-col rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-8 text-left transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
                  <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                    <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" fill="white" />
                  </svg>
                </div>
                <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Aluno
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900">Sou Aluno</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Receba uma lista personalizada de professores alinhados ao seu objetivo,
                  nível e disponibilidade.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 transition-all hover:gap-3">
                  Entrar como aluno <ArrowRight className="size-4" aria-hidden />
                </span>
              </OpenAuthModal>

              <Link
                href="/dar-aulas"
                className="flex w-full flex-col rounded-xl border border-slate-200 border-t-4 border-t-slate-700 bg-white p-8 text-left transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" />
                  </svg>
                </div>
                <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Professor
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900">Sou Professor</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Crie seu perfil profissional e seja encontrado por alunos com objetivos
                  compatíveis com sua especialidade.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 transition-all hover:gap-3">
                  Dar aulas na FitMatch <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* DUAS FORMAS DE BUSCAR */}
      <section id="ajuda-fitmatch" className="border-b border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Como usar
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Duas formas de encontrar o professor certo
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-5 rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Search className="size-5" aria-hidden />
              </div>
              <div>
                <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Busca por critério
                </span>
                <h3 className="mt-3 text-xl font-bold text-slate-900">Você controla os filtros</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Filtre por cidade, especialidade, modalidade (presencial, online ou híbrido)
                  e faixa de preço. Ideal quando você já sabe o que procura.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {['Busca por cidade e raio de distância', 'Filtro por especialidade', 'Resultados com avaliações e preço'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Link href="/profissionais" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-emerald-600 transition-all hover:gap-3">
                  Abrir busca <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <OpenAuthModal mode="login" callbackUrl="/profissionais" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-emerald-600 transition-all hover:gap-3">
                  Experimentar busca <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
              )}
            </div>

            <div className="flex flex-col gap-5 rounded-xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <div>
                <span className="inline-block rounded-md bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  Recomendação inteligente
                </span>
                <h3 className="mt-3 text-xl font-bold text-slate-900">A plataforma trabalha por você</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Informe seus objetivos, nível e preferências uma vez. A plataforma analisa todos os
                  professores e gera um ranking com explicações em português.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {['Ranking ordenado por compatibilidade', 'Explicação em português para cada professor', 'Atualiza conforme seu perfil muda'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-violet-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Link href="/descobrir" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-violet-600 transition-all hover:gap-3">
                  Descobrir profissionais <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <OpenAuthModal mode="register" callbackUrl="/descobrir" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-violet-600 transition-all hover:gap-3">
                  Gerar meu ranking <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA — penúltima seção */}
      <section className="border-b border-slate-100 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              É simples assim
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Como funciona a FitMatch
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              Do cadastro ao primeiro contato com seu professor em menos de 5 minutos.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-3">
            <div
              className="pointer-events-none absolute left-0 right-0 top-[18px] hidden h-px bg-slate-200 sm:block"
              aria-hidden
            />

            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white">
                      {item.step}
                    </span>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconClass}`}>
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROBLEMA → SOLUÇÃO (última seção — não autenticado) */}
      {!isAuthenticated && (
        <section className="bg-slate-50 py-20 sm:py-28">
          <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
            <div className="mb-14 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                O problema que resolvemos
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Encontrar o professor certo levava meses.{' '}
                <span className="text-emerald-600">Agora leva minutos.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  problem: 'Depende de indicação boca a boca',
                  solution: 'Plataforma analisa todos os professores disponíveis por você',
                },
                {
                  problem: 'Perfis sem contexto — não sabe se é compatível',
                  solution: 'Cada recomendação vem com explicação clara em português',
                },
                {
                  problem: 'Não sabe se o professor atende seu objetivo',
                  solution: 'Match por objetivo, localização, modalidade e orçamento',
                },
              ].map((item) => (
                <div key={item.problem} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-3 text-sm text-slate-500">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-rose-400" aria-hidden />
                    <span>{item.problem}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-start gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                    <span>{item.solution}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <OpenAuthModal
                mode="register"
                callbackUrl="/descobrir"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                Criar conta grátis
                <ArrowRight className="size-4" aria-hidden />
              </OpenAuthModal>
              <p className="mt-3 text-xs text-slate-400">Sem cartão de crédito. Sem compromisso.</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA final — autenticado */}
      {isAuthenticated && (
        <section className="bg-emerald-600 py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-6 text-center lg:px-10">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Continue explorando
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Encontre seu professor ideal
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-emerald-100">
              Ajuste suas preferências e veja o ranking gerado especialmente para você.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/descobrir"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-7 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.98]"
              >
                Buscar professores
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/descobrir"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/30 bg-transparent px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Descobrir professores
              </Link>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
