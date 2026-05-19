export function DiscoverCardSkeleton() {
  return (
    <li className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5">
      {/* Photo placeholder */}
      <div className="h-[88px] w-[88px] shrink-0 rounded-lg skeleton sm:h-24 sm:w-24" />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-40 rounded skeleton" />
            <div className="h-3 w-28 rounded skeleton" />
          </div>
          <div className="h-8 w-8 rounded-md skeleton" />
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3.5 w-3.5 rounded skeleton" />
          ))}
          <div className="ml-1 h-3 w-20 rounded skeleton" />
        </div>

        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-3/4 rounded skeleton" />

        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-md skeleton" />
          <div className="h-5 w-20 rounded-md skeleton" />
          <div className="h-5 w-14 rounded-md skeleton" />
        </div>

        <div className="flex gap-4">
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-3 w-20 rounded skeleton" />
          <div className="h-3 w-28 rounded skeleton" />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="h-3 w-32 rounded skeleton" />
          <div className="h-7 w-20 rounded-md skeleton" />
        </div>
      </div>
    </li>
  );
}
