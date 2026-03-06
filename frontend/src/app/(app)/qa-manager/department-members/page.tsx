import type { Metadata } from "next";
import { QaManagerDepartmentMembersContent } from "@/components/features/qa-manager/qa-manager-department-members-content";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Department Members",
  description:
    "View departments (excl. IT Services and QA Office) with their active QA Coordinator. Read-only.",
};

export default function QaManagerDepartmentMembersPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <QaManagerDepartmentMembersContent />
    </div>
  );
}
