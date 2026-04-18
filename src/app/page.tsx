import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 py-20 dark:from-zinc-950 dark:to-black">
      <section className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <span className="rounded-full border border-zinc-300 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
          Protótipo de TCC
        </span>

        <h1 className="text-5xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          FitMatch
        </h1>

        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          Conectamos alunos e profissionais de educação física através de{' '}
          <strong>inteligência artificial</strong>. A plataforma entende seus
          objetivos, nível, orçamento e preferência por aulas presenciais ou
          online e te entrega um ranking dos profissionais mais compatíveis.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/matches"
            className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Ver meus matches
          </Link>
          <a
            href="https://github.com/"
            className="inline-flex items-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500"
          >
            Sobre o projeto
          </a>
        </div>

        <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Perfil orientado a objetivos"
            description="Emagrecimento, força, flexibilidade, reabilitação — a IA traduz o que você quer em um match."
          />
          <FeatureCard
            title="Presencial, online ou híbrido"
            description="Respeita sua modalidade preferida e trata proximidade geográfica quando necessária."
          />
          <FeatureCard
            title="Ranking explicável"
            description="Cada match vem com uma justificativa curta em português, nunca um score vazio."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
