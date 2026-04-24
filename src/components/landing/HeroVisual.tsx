const mockMatches = [
  {
    name: 'Ana Martins',
    role: 'Personal Trainer · Híbrido',
    score: 97,
    initials: 'AM',
    color: '#2563eb',
    tag: 'Funcional',
  },
  {
    name: 'João Pereira',
    role: 'Yoga & Meditação · Online',
    score: 89,
    initials: 'JP',
    color: '#7c3aed',
    tag: 'Yoga',
  },
  {
    name: 'Paula Ribeiro',
    role: 'Personal Online · Nutrição',
    score: 82,
    initials: 'PR',
    color: '#059669',
    tag: 'Nutrição',
  },
];

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600">
        {score}%
      </span>
    </div>
  );
}

export function HeroVisual({ compact = false }: { compact?: boolean }) {
  const visible = compact ? mockMatches.slice(0, 2) : mockMatches;

  return (
    <div className="fitmatch-hero-visual-shell w-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Matches gerados por IA
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Baseado no seu perfil</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
          {mockMatches.length} resultados
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {visible.map((m, i) => (
          <div
            key={m.name}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-blue-100 hover:shadow"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: m.color }}
            >
              {m.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                {i === 0 && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                    #1
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-400">{m.role}</p>
            </div>
            <ScoreRing score={m.score} size={44} />
          </div>
        ))}
      </div>

      {!compact && (
        <p className="mt-4 text-center text-xs text-slate-400">
          Cada match vem com justificativa em português
        </p>
      )}
    </div>
  );
}
