export function HeroVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? 'fitmatch-hero-visual-shell min-h-44 w-full sm:min-h-52'
          : 'fitmatch-hero-visual-shell h-full min-h-52 w-full lg:min-h-[22rem]'
      }
    >
      <div className="fitmatch-hero-visual-grid" aria-hidden />
      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Matching com IA
        </p>
        <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
          Cada sugestão leva em conta objetivos, orçamento e modalidade — com justificativa clara.
        </p>
      </div>
    </div>
  );
}
