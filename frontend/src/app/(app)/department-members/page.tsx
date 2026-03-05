import type { Metadata } from "next";
import { DepartmentMembersContent } from "@/components/features/department-members/department-members-content";
import { DepartmentMembersRedirect } from "@/components/features/department-members/department-members-redirect";
import { buildPageTitle } from "@/config/constants";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: buildPageTitle("Department Members"),
  description: "View members in your department.",
};

export default function DepartmentMembersPage() {
  return (
    <DepartmentMembersRedirect>
      <div className={MANAGEMENT_PAGE_CLASS}>
        <DepartmentMembersContent />
      </div>
    </DepartmentMembersRedirect>
  );
}
