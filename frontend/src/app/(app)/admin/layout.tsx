/**
 * Admin content only. Global header/sidebar come from (app)/layout.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
