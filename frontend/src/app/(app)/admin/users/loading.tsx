import { AdminUsersTableSkeleton } from "@/components/features/admin/users-table-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export default function AdminUsersLoading() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <AdminUsersTableSkeleton />
    </div>
  );
}
