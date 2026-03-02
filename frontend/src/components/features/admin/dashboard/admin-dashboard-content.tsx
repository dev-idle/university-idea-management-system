"use client";

import {
  DASHBOARD_SECTION_HEADING_CLASS,
  CARD_STAT_LABEL_CLASS,
  TYPO_STAT_COORD,
  TYPO_STAT_BASE_COORD,
  TYPO_BODY_SM,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../constants";
import { useAdminDashboardStats, type AdminDashboardStats } from "@/hooks/use-admin-dashboard";
import { LoadingState } from "@/components/ui/loading-state";
import { getRoleLabel, type Role } from "@/lib/rbac";
import { cn } from "@/lib/utils";

function AdminOverview({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Total users</p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>{stats.totalUsers}</p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Departments</p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>{stats.departmentCount}</p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Active academic year</p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
          {stats.activeAcademicYear?.name ?? "—"}
        </p>
      </div>
    </div>
  );
}

function AdminUsersByRole({ stats }: { stats: AdminDashboardStats }) {
  const roles: Role[] = ["ADMIN", "QA_MANAGER", "QA_COORDINATOR", "STAFF"];
  const roleOrder: Record<Role, number> = {
    ADMIN: 0,
    QA_MANAGER: 1,
    QA_COORDINATOR: 2,
    STAFF: 3,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {roles
        .sort((a, b) => roleOrder[a] - roleOrder[b])
        .map((role) => {
          const count = stats.usersByRole[role] ?? 0;
          return (
            <div key={role} className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
              <p className={CARD_STAT_LABEL_CLASS}>{getRoleLabel(role)}</p>
              <p className={cn("mt-1.5 tabular-nums", TYPO_STAT_BASE_COORD)}>
                {count}
              </p>
            </div>
          );
        })}
    </div>
  );
}

function getStatusHint(status: string): string {
  if (status === "ok") return "";
  if (status === "missing_both") return "No QA Coordinator · No staff";
  if (status === "missing_qc") return "No QA Coordinator";
  return "No staff";
}

function DepartmentComplianceSection({ stats }: { stats: AdminDashboardStats }) {
  const applicable = stats.departmentCompliance.filter((d) => !d.isExcluded);
  const compliant = applicable.filter((d) => d.status === "ok");
  const nonCompliant = applicable.filter((d) => d.status !== "ok");
  const totalApplicable = applicable.length;

  return (
    <div className={cn(UNIFIED_CARD_CLASS, "px-6 py-5")}>
        {stats.departmentCompliance.length === 0 ? (
          <p className={cn("py-8 text-center", TYPO_BODY_SM)}>No departments</p>
        ) : (
          <>
            <div className="mb-5">
              <span className={cn("text-[12px] text-muted-foreground/75", totalApplicable > 0 && "tabular-nums")}>
                {compliant.length} of {totalApplicable} compliant
              </span>
              {nonCompliant.length > 0 && (
                <span className="text-[12px] text-muted-foreground/65 ml-2 tabular-nums">
                  · {nonCompliant.length} need{nonCompliant.length === 1 ? "s" : ""} attention
                </span>
              )}
            </div>

            <ul className="divide-y divide-border/30" role="list">
              {stats.departmentCompliance.map((d) => {
                const isExcluded = d.isExcluded;
                const isOk = !isExcluded && d.status === "ok";
                return (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className="font-sans text-sm text-foreground/88 truncate min-w-0">
                      {d.name}
                    </span>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground/75">
                      {isExcluded ? (
                        <span>—</span>
                      ) : (
                        <>
                          <span className="tabular-nums">
                            QC{d.hasQaCoordinator ? " ✓" : " —"} · {d.staffCount} staff
                          </span>
                          {!isOk && (
                            <span className="text-muted-foreground/70">
                              {getStatusHint(d.status)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
    </div>
  );
}

export function AdminDashboardContent() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className={`${UNIFIED_CARD_CLASS} min-h-[180px] p-6`}>
          <LoadingState compact />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={UNIFIED_CARD_CLASS} style={{ padding: "2rem" }}>
        <p className={TYPO_BODY_SM}>Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="admin-overview-heading">
        <h2 id="admin-overview-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Overview
        </h2>
        <div className="mt-4">
          <AdminOverview stats={stats} />
        </div>
      </section>

      <section aria-labelledby="admin-users-heading">
        <h2 id="admin-users-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Users by role
        </h2>
        <div className="mt-4">
          <AdminUsersByRole stats={stats} />
        </div>
      </section>

      <section aria-labelledby="admin-compliance-heading">
        <h2 id="admin-compliance-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Department rules
        </h2>
        <div className="mt-4">
          <DepartmentComplianceSection stats={stats} />
        </div>
      </section>
    </div>
  );
}
