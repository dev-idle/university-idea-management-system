import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
  description: "Staff dashboard. Backend enforces all authorization.",
};

/** Staff entry route: one dashboard per role. No shared dashboards. */
export default function StaffPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Staff</h1>
      <p className="text-sm text-muted-foreground">
        Staff dashboard. Backend enforces all authorization.
      </p>
    </div>
  );
}
