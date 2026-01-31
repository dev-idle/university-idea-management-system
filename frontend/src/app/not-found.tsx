import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
