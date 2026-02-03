import { Card, CardContent } from "@/components/ui/card";

const USERS_TABLE_COLUMN_COUNT = 5;
const SKELETON_ROW_COUNT = 5;

export default function AdminUsersLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-xl border border-border/90 bg-muted/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="h-9 w-full max-w-xs shrink-0 animate-pulse rounded-lg bg-muted/40" />
        <div className="h-9 w-20 shrink-0 animate-pulse rounded-lg bg-muted/50" />
      </div>
      <Card className="overflow-hidden rounded-xl border border-border/90 bg-card py-0 shadow-sm">
        <CardContent className="gap-0 p-0">
          <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
            <div className="flex gap-6">
              {Array.from({ length: USERS_TABLE_COLUMN_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="h-3.5 flex-1 min-w-0 max-w-24 animate-pulse rounded bg-muted/60"
                />
              ))}
            </div>
          </div>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
            <div
              key={i}
              className="flex gap-6 border-b border-border/80 px-4 py-3 last:border-0 sm:px-6"
            >
              <div className="h-4 w-40 animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted/50" />
            </div>
          ))}
          <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <div className="flex gap-2">
              <div className="h-9 w-9 animate-pulse rounded-md bg-muted/50" />
              <div className="h-9 w-9 animate-pulse rounded-md bg-muted/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
