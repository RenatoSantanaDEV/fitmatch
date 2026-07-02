import type { ElementType } from 'react';

interface InsightStatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  hint?: string;
}

export function InsightStatCard({ label, value, icon: Icon, hint }: InsightStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="size-3.5 text-slate-400" aria-hidden />
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
