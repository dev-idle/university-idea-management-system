export default function LoginLoading() {
  return (
    <div className="login-page-bg grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mx-auto" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
