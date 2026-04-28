const mockRecommendations = [
  {
    name: 'Ana Martins',
    role: 'Personal Trainer · Híbrido',
    score: 97,
    initials: 'AM',
    bg: '#2563eb',
    tagColor: 'bg-blue-100 text-blue-700',
    tag: 'Funcional',
    rank: 1,
  },
  {
    name: 'João Pereira',
    role: 'Yoga & Meditação · Online',
    score: 89,
    initials: 'JP',
    bg: '#7c3aed',
    tagColor: 'bg-violet-100 text-violet-700',
    tag: 'Yoga',
    rank: 2,
  },
  {
    name: 'Paula Ribeiro',
    role: 'Personal Online · Nutrição',
    score: 82,
    initials: 'PR',
    bg: '#059669',
    tagColor: 'bg-emerald-100 text-emerald-700',
    tag: 'Nutrição',
    rank: 3,
  },
];

function ScoreRing({ score }: { score: number }) {
  const size = 52;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 85 ? '#2563eb' : score >= 70 ? '#f59e0b' : '#64748b';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700">
        {score}%
      </span>
    </div>
  );
}

export function HeroVisual({ compact = false }: { compact?: boolean }) {
  const visible = compact ? mockRecommendations.slice(0, 2) : mockRecommendations;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-blue-900/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
            Recomendações para você
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Gerado por IA · Agora mesmo</p>
        </div>
        <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">
          {mockRecommendations.length} resultados
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col divide-y divide-slate-100">
        {visible.map((m) => (
          <div key={m.name} className="flex items-center gap-4 px-5 py-4">
            {/* Rank */}
            <span className="w-4 shrink-0 text-center text-xs font-black text-slate-300">
              {m.rank}
            </span>
            {/* Avatar */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
              style={{ backgroundColor: m.bg }}
            >
              {m.initials}
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-slate-800">{m.name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${m.tagColor}`}>
                  {m.tag}
                </span>
              </div>
              <p className="truncate text-xs text-slate-400">{m.role}</p>
            </div>
            {/* Score */}
            <ScoreRing score={m.score} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-center text-[11px] text-slate-400">
          Cada sugestão vem com explicação em português
        </p>
      </div>
    </div>
  );
}
