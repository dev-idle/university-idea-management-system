import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileContent } from "@/components/features/profile/profile-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your account details and security. No registration; contact administrator for access.",
};

/** Profile loading skeleton: uses muted background per design system. */
function ProfilePageSkeleton() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-border/90 bg-card px-6 py-7 shadow-sm" aria-hidden>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Skeleton className="size-24 shrink-0 rounded-full bg-muted/80" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-7 w-48 bg-muted/80" />
            <Skeleton className="h-4 w-36 bg-muted/60" />
            <Skeleton className="h-4 w-56 bg-muted/60" />
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <section className="overflow-hidden rounded-xl border border-border/90 bg-card shadow-sm" aria-hidden>
          <div className="border-border/80 border-b px-6 py-5">
            <div className="flex gap-3 items-center">
              <Skeleton className="size-9 rounded-lg bg-muted/60" />
              <Skeleton className="h-4 w-44 bg-muted/60" />
            </div>
            <Skeleton className="mt-2 h-4 w-72 bg-muted/50" />
          </div>
          <div className="px-6 py-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={i === 2 ? "sm:col-span-2" : ""}>
                  <Skeleton className="mb-2 h-3.5 w-24 bg-muted/50" />
                  <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-10 w-28 rounded-lg bg-muted/50" />
          </div>
        </section>
        <section className="overflow-hidden rounded-xl border border-border/90 bg-card shadow-sm" aria-hidden>
          <div className="border-border/80 border-b px-6 py-5">
            <div className="flex gap-3 items-center">
              <Skeleton className="size-9 rounded-lg bg-muted/60" />
              <Skeleton className="h-4 w-36 bg-muted/60" />
            </div>
            <Skeleton className="mt-2 h-4 w-56 bg-muted/50" />
          </div>
          <div className="space-y-6 px-6 py-6">
            <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
            <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
            <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
            <Skeleton className="h-10 w-32 rounded-lg bg-muted/50" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Manage your account details and security. Update your information or change your password below.
      </p>
      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
