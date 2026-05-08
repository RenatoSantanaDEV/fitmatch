export function DiscoverCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] skeleton" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="mt-0.5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, starPlaceholderIndex) => (
            <div key={starPlaceholderIndex} className="h-3 w-3 rounded-sm skeleton" />
          ))}
          <div className="ml-1 h-3 w-16 rounded skeleton" />
        </div>
        <div className="h-3.5 w-full rounded skeleton" />
        <div className="h-3.5 w-3/4 rounded skeleton" />
        <div className="mt-0.5 flex gap-1.5">
          <div className="h-5 w-16 rounded-full skeleton" />
          <div className="h-5 w-20 rounded-full skeleton" />
        </div>
        <div className="mt-0.5 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-4 w-24 rounded skeleton" />
          <div className="h-8 w-24 rounded-full skeleton" />
        </div>
      </div>
    </li>
  );
}
