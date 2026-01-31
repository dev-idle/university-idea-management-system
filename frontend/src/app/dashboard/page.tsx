import { Suspense } from "react";
import { DashboardContent } from "@/components/features/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
