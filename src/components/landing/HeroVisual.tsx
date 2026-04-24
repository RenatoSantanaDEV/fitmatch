const mockMatches = [
  {
    name: 'Ana Martins',
    role: 'Personal Trainer',
    city: 'São Paulo, SP',
    score: 97,
    tag: 'Funcional · Híbrido',
    initials: 'AM',
    color: 'bg-blue-500',
  },
  {
    name: 'João Pereira',
    role: 'Yoga & Meditação',
    city: 'Belo Horizonte, MG',
    score: 89,
    tag: 'Yoga · Online',
    initials: 'JP',
    color: 'bg-violet-500',
  },
  {
    name: 'Paula Ribeiro',
    role: 'Personal Online',
    city: 'Curitiba, PR',
    score: 82,
    tag: 'Nutrição · Online',
    initials: 'PR',
    color: 'bg-emerald-500',
  },
];

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(226 232 240)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-brand">{score}%</span>
    </div>
  );
}

export function HeroVisual({ compact = false }: { compact?: boolean }) {
  const visible = compact ? mockMatches.slice(0, 2) : mockMatches;

  return (
    <div
      className={
        compact
          ? 'fitmatch-hero-visual-shell w-full p-4'
          : 'fitmatch-hero-visual-shell h-full w-full p-5'
      }
    >
      <div className="relative z-10 flex h-full flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Matches gerados por IA
        </p>
        <div className="flex flex-col gap-2.5">
          {visible.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 shadow-sm"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.color}`}
              >
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.tag}</p>
              </div>
              <ScoreRing score={m.score} />
            </div>
          ))}
        </div>
        {!compact && (
          <p className="mt-auto text-xs text-muted-foreground">
            Cada match vem com justificativa em português
          </p>
        )}
      </div>
    </div>
  );
}
