export function HomeLoading() {
  return (
    <section className="mx-auto max-w-2xl space-y-8 text-center">
      <div className="h-12 w-64 animate-pulse rounded bg-muted mx-auto" />
      <div className="h-6 w-full max-w-md animate-pulse rounded bg-muted mx-auto" />
      <div className="flex justify-center gap-4">
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
      </div>
    </section>
  );
}
