"use client";

export function SubmissionCyclesManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border border-border bg-card p-12">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
