import type { Metadata } from "next";
import { DepartmentMembersContent } from "@/components/features/department-members/department-members-content";
import { buildPageTitle } from "@/config/constants";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: buildPageTitle("Department Members"),
  description: "View members in your department.",
};

export default function QaCoordinatorDepartmentMembersPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <DepartmentMembersContent />
    </div>
  );
}
