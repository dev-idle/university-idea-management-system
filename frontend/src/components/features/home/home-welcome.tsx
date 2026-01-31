import Link from "next/link";

export function HomeWelcome() {
  return (
    <section className="mx-auto max-w-2xl space-y-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        University Idea Management
      </h1>
      <p className="text-lg text-muted-foreground">
        Submit, review, and manage ideas. Built with Next.js 16, React 19, and Tailwind v4.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Dashboard
        </Link>
      </div>
    </section>
  );
}
