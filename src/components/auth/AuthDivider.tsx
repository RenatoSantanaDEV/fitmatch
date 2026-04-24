export function AuthDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border-subtle" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-surface px-3 text-muted-foreground dark:bg-surface-elevated">ou</span>
      </div>
    </div>
  );
}
