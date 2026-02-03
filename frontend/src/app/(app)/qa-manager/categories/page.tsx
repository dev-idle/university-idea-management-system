import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoriesManagement } from "@/components/features/qa-manager/categories-management";
import { CategoriesManagementSkeleton } from "@/components/features/qa-manager/categories-management-skeleton";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Create and manage idea categories. QA Manager only. Backend enforces authorization.",
};

export default function QaManagerCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage categories for idea classification. Duplicate names are not allowed. Delete is only available when no ideas use the category; backend enforces all rules.
        </p>
        <hr className="border-border/80" aria-hidden />
      </div>
      <Suspense fallback={<CategoriesManagementSkeleton />}>
        <CategoriesManagement />
      </Suspense>
    </div>
  );
}
