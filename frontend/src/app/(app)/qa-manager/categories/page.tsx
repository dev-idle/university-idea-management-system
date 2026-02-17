import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoriesManagement } from "@/components/features/qa-manager/categories-management";
import { CategoriesManagementSkeleton } from "@/components/features/qa-manager/categories-management-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Categories",
  description: "Create and manage idea categories. Backend enforces authorization.",
};

export default function QaManagerCategoriesPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<CategoriesManagementSkeleton />}>
        <CategoriesManagement />
      </Suspense>
    </div>
  );
}
