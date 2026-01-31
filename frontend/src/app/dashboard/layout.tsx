export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
