"use client";

import Link from "next/link";
import { Building2, CalendarDays, ChevronRight, Users } from "lucide-react";
import { Can } from "@/components/ui/can";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SECTION_LABEL_CLASS,
  ICON_BOX_PRIMARY_CLASS,
  FOCUS_RING_CLASS,
  TYPO_STAT,
} from "@/config/design";
import {
  DASHBOARD_STAT_CARD_CLASS,
  DASHBOARD_CARD_CLASS,
} from "../constants";
import { ROUTES } from "@/config/constants";
import { useAcademicYearsQuery } from "@/hooks/use-academic-years";
import { useDepartmentsQuery } from "@/hooks/use-departments";
import { useUsersListQuery } from "@/hooks/use-users";
import type { LucideIcon } from "lucide-react";

const ADMIN_FUNCTIONS = [
  {
    permission: "USERS" as const,
    href: ROUTES.ADMIN_USERS,
    title: "User management",
    description: "Manage user accounts and roles.",
    icon: Users,
  },
  {
    permission: "DEPARTMENTS" as const,
    href: ROUTES.ADMIN_DEPARTMENTS,
    title: "Department management",
    description: "Manage departments and assignments.",
    icon: Building2,
  },
  {
    permission: "ACADEMIC_YEARS" as const,
    href: ROUTES.ADMIN_ACADEMIC_YEARS,
    title: "Academic years",
    description: "Configure academic years for idea cycles.",
    icon: CalendarDays,
  },
] as const;

function AdminModuleLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col p-5 transition-all duration-200 hover:bg-primary/[0.07] hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)] ${FOCUS_RING_CLASS} ${DASHBOARD_CARD_CLASS}`}
      aria-label={`${title} — ${description}`}
    >
      <div className={ICON_BOX_PRIMARY_CLASS}>
        <Icon className="size-5" aria-hidden />
      </div>
      <CardHeader className="flex-1 gap-1 p-0 pt-4">
        <CardTitle className="text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </CardTitle>
        <CardDescription className="text-xs font-normal text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary/60 transition-colors group-hover:text-primary">
        Manage
        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

function AdminSummary() {
  const { data: usersData } = useUsersListQuery({ page: 1, limit: 1 });
  const { data: departments } = useDepartmentsQuery();
  const { data: academicYearsData } = useAcademicYearsQuery();
  const academicYears = academicYearsData?.list ?? [];
  const activeYear = academicYears.find((y) => y.isActive);

  const totalUsers = usersData?.total ?? null;
  const departmentCount = departments?.length ?? null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className={DASHBOARD_STAT_CARD_CLASS}>
        <p className={SECTION_LABEL_CLASS}>Total users</p>
        <p className={`mt-1 ${TYPO_STAT}`}>
          {totalUsers !== null ? totalUsers : "—"}
        </p>
      </div>
      <div className={DASHBOARD_STAT_CARD_CLASS}>
        <p className={SECTION_LABEL_CLASS}>Departments</p>
        <p className={`mt-1 ${TYPO_STAT}`}>
          {departmentCount !== null ? departmentCount : "—"}
        </p>
      </div>
      <div className={DASHBOARD_STAT_CARD_CLASS}>
        <p className={SECTION_LABEL_CLASS}>Active academic year</p>
        <p className={`mt-1 ${TYPO_STAT}`}>
          {activeYear?.name ?? "—"}
        </p>
      </div>
    </div>
  );
}

export function AdminDashboardContent() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="admin-summary-heading">
        <h2 id="admin-summary-heading" className="sr-only">
          Summary
        </h2>
        <AdminSummary />
      </section>
      <section aria-labelledby="admin-modules-heading">
        <h2 id="admin-modules-heading" className={SECTION_LABEL_CLASS}>
          Management
        </h2>
        <nav
          className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Admin modules"
        >
          {ADMIN_FUNCTIONS.map((item) => (
            <Can key={item.href} permission={item.permission}>
              <AdminModuleLink
                href={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            </Can>
          ))}
        </nav>
      </section>
    </div>
  );
}
