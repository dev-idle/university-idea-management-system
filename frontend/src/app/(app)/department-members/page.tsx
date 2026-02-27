import type { Metadata } from "next";
import { DepartmentMembersContent } from "@/components/features/department-members/department-members-content";
import { buildPageTitle } from "@/config/constants";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: buildPageTitle("Department Members"),
  description: "View members in your department.",
};

export default function DepartmentMembersPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <DepartmentMembersContent />
    </div>
  );
}
