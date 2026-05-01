const mockRecommendations = [
  {
    name: 'Ana Martins',
    role: 'Personal Trainer · Híbrido',
    score: 97,
    initials: 'AM',
    bg: 'bg-emerald-500',
    tagColor: 'bg-emerald-100 text-emerald-700',
    tag: 'Funcional',
    rank: 1,
    reasoning: 'Perfil alinhado com seu objetivo de emagrecimento e disponibilidade híbrida.',
  },
  {
    name: 'João Pereira',
    role: 'Yoga & Meditação · Online',
    score: 89,
    initials: 'JP',
    bg: 'bg-violet-500',
    tagColor: 'bg-violet-100 text-violet-700',
    tag: 'Yoga',
    rank: 2,
    reasoning: 'Especialista em relaxamento e mobilidade, complementa seu treino principal.',
  },
  {
    name: 'Paula Ribeiro',
    role: 'Personal Online · Nutrição',
    score: 82,
    initials: 'PR',
    bg: 'bg-orange-500',
    tagColor: 'bg-orange-100 text-orange-700',
    tag: 'Nutrição',
    rank: 3,
    reasoning: 'Abordagem holística com suporte nutricional integrado ao treino.',
  },
];

function ScoreRing({ score }: { score: number }) {
  const size = 52;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const ringColor = score >= 85 ? '#059669' : score >= 70 ? '#f59e0b' : '#6b7280';
  const trackColor = score >= 85 ? '#d1fae5' : score >= 70 ? '#fef3c7' : '#f1f5f9';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth="3.5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[11px] font-black text-slate-800">{score}%</span>
        <span className="text-[8px] font-medium text-slate-400">match</span>
      </span>
    </div>
  );
}

export function HeroVisual({ compact = false }: { compact?: boolean }) {
  const visible = compact ? mockRecommendations.slice(0, 2) : mockRecommendations;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-violet-300" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-100">
              IA · Recomendações para você
            </p>
          </div>
          <p className="mt-0.5 text-xs text-violet-200/80">Gerado agora • com base no seu perfil</p>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          {mockRecommendations.length} encontrados
        </span>
      </div>

      {/* Professor list */}
      <div className="flex flex-col divide-y divide-slate-100">
        {visible.map((m) => (
          <div key={m.name} className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-5 shrink-0 text-center text-xs font-black text-slate-300">
              {m.rank}º
            </span>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${m.bg}`}
            >
              {m.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-slate-800">{m.name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${m.tagColor}`}>
                  {m.tag}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">{m.role}</p>
            </div>
            <ScoreRing score={m.score} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3">
        <p className="text-center text-[11px] text-slate-500">
          ✦ Cada sugestão vem com explicação em português
        </p>
      </div>
    </div>
  );
}
