import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QA Coordinator",
  description: "QA Coordinator dashboard.",
};

export default function QaCoordinatorDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">QA Coordinator</h1>
      <p className="text-sm text-muted-foreground">
        QA Coordinator dashboard. Backend enforces all authorization.
      </p>
    </div>
  );
}
