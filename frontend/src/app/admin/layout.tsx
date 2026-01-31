import Link from "next/link";
import { Can } from "@/components/ui/can";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Can permission="USERS">
            <Link
              href="/admin/users"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Users
            </Link>
          </Can>
          <Can permission="DEPARTMENTS">
            <Link
              href="/admin/departments"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Departments
            </Link>
          </Can>
          <Can permission="ACADEMIC_YEARS">
            <Link
              href="/admin/academic-years"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Academic years
            </Link>
          </Can>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
