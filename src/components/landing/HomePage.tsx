import Link from 'next/link';
import { Globe2, Sparkles, Target } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { buttonVariants } from '../ui/button-variants';
import { FeatureCard } from '../ui/FeatureCard';
import { HeroVisual } from './HeroVisual';

export function HomePage() {
  return (
    <main className="fitmatch-hero-bg flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <Badge variant="outline" className="mx-auto lg:mx-0">
              Beta
            </Badge>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                FitMatch
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Conectamos alunos e profissionais de educação física através de{' '}
                <span className="fitmatch-text-ai font-semibold">inteligência artificial</span>. A
                plataforma entende seus objetivos, nível, orçamento e preferência por aulas
                presenciais ou online e entrega um ranking dos profissionais mais compatíveis.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Link href="/matches" className={buttonVariants({ variant: 'primary' })}>
                Ver meus matches
              </Link>
              <a
                href="https://github.com/"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Sobre o projeto
              </a>
            </div>

            <div className="w-full lg:hidden">
              <HeroVisual compact />
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroVisual />
          </div>
        </div>

        <section
          className="mt-14 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Diferenciais"
        >
          <FeatureCard
            icon={<Target className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />}
            title="Perfil orientado a objetivos"
            description="Emagrecimento, força, flexibilidade, reabilitação — a IA traduz o que você quer em um match."
          />
          <FeatureCard
            icon={<Globe2 className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />}
            title="Presencial, online ou híbrido"
            description="Respeita sua modalidade preferida e trata proximidade geográfica quando necessária."
          />
          <FeatureCard
            icon={<Sparkles className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />}
            title="Ranking explicável"
            description="Cada match vem com uma justificativa curta em português, nunca um score vazio."
            className="sm:col-span-2 lg:col-span-1"
          />
        </section>
      </div>
    </main>
  );
}
