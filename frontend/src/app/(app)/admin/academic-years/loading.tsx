import { AcademicYearsManagementSkeleton } from "@/components/features/admin/academic-years-management-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export default function AdminAcademicYearsLoading() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <AcademicYearsManagementSkeleton />
    </div>
  );
}
