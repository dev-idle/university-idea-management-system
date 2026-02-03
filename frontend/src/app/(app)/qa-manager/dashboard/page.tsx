import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QA Manager",
  description: "University QA Manager dashboard.",
};

export default function QaManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">QA Manager</h1>
      <p className="text-sm text-muted-foreground">
        University QA Manager dashboard. Backend enforces all authorization.
      </p>
    </div>
  );
}
