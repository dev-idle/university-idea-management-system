export function AdminUsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full max-w-xs animate-pulse rounded-md bg-muted" />
      <div className="rounded-lg border border-border">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 border-b border-border p-4 last:border-0">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
