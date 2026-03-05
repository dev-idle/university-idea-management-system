import type { Metadata } from "next";
import { CategoriesManagement } from "@/components/features/qa-manager/categories-management";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Categories",
  description: "Create and manage idea categories. Backend enforces authorization.",
};

export default function QaManagerCategoriesPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <CategoriesManagement />
    </div>
  );
}
