import { DepartmentsManagementSkeleton } from "@/components/features/admin/departments-management-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export default function AdminDepartmentsLoading() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <DepartmentsManagementSkeleton />
    </div>
  );
}
