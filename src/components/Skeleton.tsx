export function PageSkeleton() {
  return (
    <div className="page-surface page-book relative overflow-hidden rounded-2xl border border-app-border p-6 sm:p-10">
      <div className="space-y-3">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-black/10"
            style={{ width: `${88 - (i % 5) * 9}%` }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}
