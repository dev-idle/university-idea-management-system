"use client";

import Link from "next/link";
import {
  MANAGEMENT_STAT_GRID_CLASS,
  DASHBOARD_SECTION_HEADING_CLASS,
} from "@/config/design";
import {
  CARD_STAT_LABEL_CLASS,
  TYPO_STAT_COORD,
  TYPO_STAT_BASE_COORD,
  TYPO_BODY_SM,
  MGMT_BORDER_DIVIDER,
  MGMT_BG_TOOLBAR,
  MGMT_BG_ROW_HOVER,
  MGMT_DIVIDE,
} from "@/config/design";
import {
  UNIFIED_CARD_CLASS,
  STATUS_BADGE_ACTIVE_WARM_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
} from "../constants";
import { formatAcademicYearDisplay } from "../academic-years.utils";
import { useAdminDashboardStats, type AdminDashboardStats } from "@/hooks/use-admin-dashboard";
import { LoadingState } from "@/components/ui/loading-state";
import { getRoleLabel, type Role } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { CheckCircle2, UserCog, Users, ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { useIsMobile } from "@/hooks/use-mobile";

function AdminOverview({ stats }: { stats: AdminDashboardStats }) {
  const cycleStats = stats.activeYearCycleStats;
  const totalActivated =
    cycleStats
      ? cycleStats.nonActiveWithIdeas + cycleStats.activeWithIdeas
      : 0;
  const cycleLabel =
    !stats.activeAcademicYear ? "—" : totalActivated > 0 ? `${totalActivated}` : "None";

  return (
    <div className={MANAGEMENT_STAT_GRID_CLASS}>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Total users</p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>{stats.totalUsers}</p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Total departments</p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>{stats.departmentCount}</p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Active academic year</p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
          {stats.activeAcademicYear ? formatAcademicYearDisplay(stats.activeAcademicYear.name) : "—"}
        </p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>
          Total proposal cycles
        </p>
        <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
          {cycleLabel}
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
    <div className={MANAGEMENT_STAT_GRID_CLASS}>
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

function DepartmentComplianceSection({ stats }: { stats: AdminDashboardStats }) {
  const isMobile = useIsMobile();
  const applicable = stats.departmentCompliance.filter((d) => !d.isExcluded);
  const nonCompliant = applicable.filter((d) => d.status !== "ok");
  const totalApplicable = applicable.length;
  const allCompliant = totalApplicable > 0 && nonCompliant.length === 0;

  return (
    <div className={UNIFIED_CARD_CLASS}>
      {stats.departmentCompliance.length === 0 ? (
        <div className="px-6 py-8">
          <p className={TYPO_BODY_SM}>No departments</p>
        </div>
      ) : allCompliant ? (
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/[0.08]">
              <CheckCircle2 className="size-5 text-success" aria-hidden />
            </div>
            <div>
              <p className={CARD_STAT_LABEL_CLASS}>All compliant</p>
              <p className={`mt-0.5 ${TYPO_STAT_COORD}`}>
                {totalApplicable} department{totalApplicable === 1 ? "" : "s"} meet the rules
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "flex items-center justify-between gap-4 border-b px-6 py-4",
              MGMT_BORDER_DIVIDER,
              MGMT_BG_TOOLBAR
            )}
          >
            <p className={CARD_STAT_LABEL_CLASS}>
              {nonCompliant.length} need{nonCompliant.length === 1 ? "s" : ""} attention
            </p>
            <Link
              href={ROUTES.ADMIN_DEPARTMENT_MEMBERS}
              className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-primary/85 transition-colors hover:text-primary"
            >
              Manage
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ul className={cn("divide-y", MGMT_DIVIDE)} role="list">
            {nonCompliant.map((d) => {
              const qcLabel = d.hasQaCoordinator ? "QA Coordinator" : "No QA Coordinator";
              const staffLabel = d.staffCount === 0 ? "No staff" : `${d.staffCount} staff`;
              return (
                <li
                  key={d.id}
                  className={cn(
                    "flex flex-col gap-2 px-6 py-3.5 transition-colors sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4",
                    MGMT_BG_ROW_HOVER
                  )}
                >
                  <span
                    className="min-w-0 truncate text-sm text-foreground/92"
                    title={isMobile ? d.name : undefined}
                  >
                    {d.name}
                  </span>
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden",
                        d.hasQaCoordinator
                          ? STATUS_BADGE_INACTIVE_CLASS
                          : STATUS_BADGE_ACTIVE_WARM_CLASS
                      )}
                      title={isMobile ? qcLabel : undefined}
                    >
                      <UserCog className="size-3.5 shrink-0" aria-hidden />
                      <span className="min-w-0 truncate">{qcLabel}</span>
                    </span>
                    <span
                      className={cn(
                        "inline-flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden",
                        d.staffCount > 0
                          ? STATUS_BADGE_INACTIVE_CLASS
                          : STATUS_BADGE_ACTIVE_WARM_CLASS
                      )}
                      title={isMobile ? staffLabel : undefined}
                    >
                      <Users className="size-3.5 shrink-0" aria-hidden />
                      <span className="min-w-0 truncate">{staffLabel}</span>
                    </span>
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
