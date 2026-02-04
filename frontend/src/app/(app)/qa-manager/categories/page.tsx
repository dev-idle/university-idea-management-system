import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoriesManagement } from "@/components/features/qa-manager/categories-management";
import { CategoriesManagementSkeleton } from "@/components/features/qa-manager/categories-management-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Create and manage idea categories. QA Manager only. Backend enforces authorization.",
};

export default function QaManagerCategoriesPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="Categories"
        description="Manage categories for proposal classification. Duplicate names are not permitted. Deletion is available only when no proposals use the category; all rules are enforced server-side."
        descriptionWide
      />
      <Suspense fallback={<CategoriesManagementSkeleton />}>
        <CategoriesManagement />
      </Suspense>
    </div>
  );
}
