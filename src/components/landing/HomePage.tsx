'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  Shield,
  MessageSquare,
  Brain,
  BadgeCheck,
  Gift,
  Languages,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { OpenAuthModal } from '../auth/OpenAuthModal';
import { FindTeacherSearchPanel } from './FindTeacherSearchPanel';

const howItWorks = [
  {
    icon: Shield,
    step: '01',
    title: 'Crie seu perfil',
    desc: 'Informe seus objetivos, nível de condicionamento, modalidade preferida e orçamento disponível.',
    color: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    icon: Zap,
    step: '02',
    title: 'IA gera o ranking',
    desc: 'Nossa inteligência artificial analisa todos os professores cadastrados e monta um ranking explicado.',
    color: 'bg-violet-500/15 text-violet-400',
  },
  {
    icon: MessageSquare,
    step: '03',
    title: 'Conecte-se',
    desc: 'Escolha o professor ideal e inicie sua jornada com uma primeira sessão gratuita.',
    color: 'bg-orange-500/15 text-orange-400',
  },
];

const features = [
  {
    icon: Brain,
    title: 'Matching por IA',
    desc: 'Algoritmo de compatibilidade que analisa objetivos, orçamento, localização e estilo de treino.',
    color: 'bg-violet-100 text-violet-700',
    delay: 'delay-0',
  },
  {
    icon: BadgeCheck,
    title: 'Perfis verificados',
    desc: 'Todos os professores passam por verificação de credenciais e são avaliados pelos alunos.',
    color: 'bg-emerald-100 text-emerald-700',
    delay: 'delay-100',
  },
  {
    icon: Gift,
    title: 'Gratuito para alunos',
    desc: 'Acesso completo à plataforma, buscas e recomendações sem nenhum custo para estudantes.',
    color: 'bg-orange-100 text-orange-700',
    delay: 'delay-200',
  },
  {
    icon: Languages,
    title: 'Explicações em português',
    desc: 'Cada recomendação vem acompanhada de um texto claro explicando por que aquele professor foi indicado.',
    color: 'bg-sky-100 text-sky-700',
    delay: 'delay-300',
  },
];

export function HomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <main className="flex flex-1 flex-col bg-white">

      {/* ===================================================
          HERO
      =================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
          <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-teal-400/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/8 blur-3xl" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 64px)',
            }}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-4 py-24 text-center sm:px-6 lg:py-32">

          {/* AI badge */}
          <div className="animate-fade-up delay-0 inline-flex w-fit items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-4 py-1.5 ai-badge-pulse">
            <span className="flex h-2 w-2 rounded-full bg-violet-400" />
            <span className="text-xs font-semibold text-violet-300">
              Matching com Inteligência Artificial
            </span>
          </div>

          <h1 className="animate-fade-up delay-100 text-5xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Encontre o professor de{' '}
            <span className="text-gradient-brand">educação física</span>{' '}
            certo para você
          </h1>

          <p className="animate-fade-up delay-200 max-w-xl text-lg leading-relaxed text-slate-300">
            A FitMatch usa IA para conectar alunos a educadores físicos compatíveis —
            com ranking personalizado e explicação em português.
          </p>

          <div className="animate-fade-up delay-300 flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <FindTeacherSearchPanel />
            ) : (
              <>
                <OpenAuthModal
                  mode="register"
                  callbackUrl="/recomendacoes"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.03] hover:bg-emerald-400 active:scale-[0.98]"
                >
                  Começar grátis
                  <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
                <OpenAuthModal
                  mode="login"
                  callbackUrl="/recomendacoes"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/20"
                >
                  Já tenho conta
                </OpenAuthModal>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-10 border-t border-white/10 pt-8">
            {[
              { value: '50+', label: 'Professores verificados', delay: 'delay-500' },
              { value: '12', label: 'Especialidades', delay: 'delay-600' },
              { value: '100%', label: 'Grátis para alunos', delay: 'delay-700' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`animate-pop-in ${s.delay} text-3xl font-extrabold text-white`}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-emerald-300/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          ROLE SELECTION (unauthenticated only)
      =================================================== */}
      {!isAuthenticated && (
        <section className="border-b border-slate-100 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
              {/* Student */}
              <OpenAuthModal
                mode="login"
                callbackUrl="/recomendacoes"
                className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white p-8 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-16 rounded-full bg-emerald-400/10 transition-all duration-500 group-hover:bg-emerald-400/20 group-hover:scale-110"
                  aria-hidden
                />
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
                      <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" fill="white" />
                    </svg>
                  </div>
                  <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Aluno
                  </span>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-900">Sou Aluno</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Receba uma lista personalizada de professores alinhados ao seu objetivo,
                    nível e disponibilidade — gerada por IA.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 transition-all group-hover:gap-3">
                    Entrar como aluno <ArrowRight className="size-4" aria-hidden />
                  </span>
                </div>
              </OpenAuthModal>

              {/* Professional */}
              <Link
                href="/dar-aulas"
                className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-8 text-left shadow-sm transition-all hover:border-orange-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-16 rounded-full bg-orange-400/10 transition-all duration-500 group-hover:bg-orange-400/20 group-hover:scale-110"
                  aria-hidden
                />
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" />
                    </svg>
                  </div>
                  <span className="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                    Professor
                  </span>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-900">Sou Professor</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Crie seu perfil profissional e seja encontrado por alunos com objetivos
                    compatíveis com sua especialidade.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 transition-all group-hover:gap-3">
                    Dar aulas na FitMatch <ArrowRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          HOW IT WORKS
      =================================================== */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              É simples assim
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Como funciona a FitMatch
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Do cadastro ao primeiro contato com seu professor em menos de 5 minutos.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-3">
            {/* Connecting dashed line */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-[18px] hidden h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent sm:block"
              aria-hidden
            />

            {howItWorks.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col gap-5"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Step number */}
                  <div className="flex items-center gap-4">
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                      {item.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
                    <Icon className="size-6" aria-hidden />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          WHY FITMATCH
      =================================================== */}
      <section className="border-b border-slate-100 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Nossos diferenciais
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Por que escolher a FitMatch?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`card-lift flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${f.color}`}>
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          DUAS FORMAS DE BUSCAR (âncora de ajuda)
      =================================================== */}
      <section id="ajuda-fitmatch" className="border-b border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Como usar
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Duas formas de encontrar o professor certo
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Busca manual */}
            <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Search className="size-6" aria-hidden />
              </div>
              <div>
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Busca por critério
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900">Você controla os filtros</h3>
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
                <Link href="/descobrir" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-emerald-600 transition-all hover:gap-3">
                  Abrir busca <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <OpenAuthModal mode="login" callbackUrl="/descobrir" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-emerald-600 transition-all hover:gap-3">
                  Experimentar busca <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
              )}
            </div>

            {/* IA Recomendações */}
            <div className="flex flex-col gap-5 rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Sparkles className="size-6" aria-hidden />
              </div>
              <div>
                <span className="inline-block rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  IA Recomendações
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900">A IA trabalha por você</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Informe seus objetivos, nível e preferências uma vez. A IA analisa todos os
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
                <Link href="/recomendacoes" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-violet-600 transition-all hover:gap-3">
                  Ver meu ranking <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <OpenAuthModal mode="register" callbackUrl="/recomendacoes" className="mt-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-violet-600 transition-all hover:gap-3">
                  Gerar meu ranking <ArrowRight className="size-4" aria-hidden />
                </OpenAuthModal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PROBLEMA → SOLUÇÃO  (substitui CTA final duplicado)
      =================================================== */}
      {!isAuthenticated && (
        <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-16 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                O problema que resolvemos
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Encontrar o professor certo levava meses.{' '}
                <span className="text-gradient-brand">Agora leva minutos.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  problem: 'Depende de indicação boca a boca',
                  solution: 'IA analisa todos os professores disponíveis por você',
                  icon: Clock,
                },
                {
                  problem: 'Perfis sem contexto — não sabe se é compatível',
                  solution: 'Cada recomendação vem com explicação clara em português',
                  icon: Brain,
                },
                {
                  problem: 'Não sabe se o professor atende seu objetivo',
                  solution: 'Match por objetivo, localização, modalidade e orçamento',
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.problem} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.04] p-6">
                    <div className="flex items-start gap-3 text-sm text-slate-500">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-rose-500/70" aria-hidden />
                      <span>{item.problem}</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-start gap-3 text-sm text-slate-200">
                      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
                      <span>{item.solution}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-14 text-center">
              <OpenAuthModal
                mode="register"
                callbackUrl="/recomendacoes"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-500 px-9 py-4 text-sm font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:scale-[1.03] hover:bg-emerald-400 active:scale-[0.98]"
              >
                Criar conta grátis — é rápido
                <ArrowRight className="size-4" aria-hidden />
              </OpenAuthModal>
              <p className="mt-3 text-xs text-slate-500">Sem cartão de crédito. Sem compromisso.</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA para usuário autenticado */}
      {isAuthenticated && (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-teal-700 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                Continue explorando
              </p>
              <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Encontre seu professor ideal
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
                Ajuste suas preferências e veja o ranking gerado especialmente para você.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/descobrir" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-extrabold text-emerald-700 shadow-2xl shadow-emerald-900/30 transition-all hover:scale-[1.03] hover:bg-emerald-50 active:scale-[0.98]">
                  Buscar professores
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/recomendacoes" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/20">
                  Ver recomendações IA
                </Link>
              </div>
          </div>
        </section>
      )}

    </main>
  );
}
