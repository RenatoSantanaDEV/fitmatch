export function DiscoverPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <span
          className="absolute h-16 w-16 rounded-full border-4 border-[#00c896]/20"
          aria-hidden="true"
        />
        {/* Spinning arc */}
        <span
          className="h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-[#00c896]"
          style={{ animationDuration: '700ms' }}
          aria-hidden="true"
        />
        {/* Inner pulse dot */}
        <span
          className="absolute h-4 w-4 animate-pulse rounded-full bg-[#00c896]"
          aria-hidden="true"
        />
      </div>
      <p className="mt-5 text-sm font-medium text-[#00c896]">Carregando…</p>
    </div>
  );
}

export default DiscoverPageSpinner;
