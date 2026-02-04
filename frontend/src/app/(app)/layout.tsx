import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";

/**
 * One global layout for the entire application (post-login).
 * Header: app name, logged-in user, role (from store), logout.
 * Sidebar: nav items strictly by role; main area renders route content.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster richColors position="top-center" />
    </>
  );
}
