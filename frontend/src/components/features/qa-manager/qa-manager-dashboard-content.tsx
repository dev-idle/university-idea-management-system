"use client";

import Link from "next/link";
import { CalendarRange, ChevronRight, Tags } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CARD_CLASS,
  CARD_STAT_CLASS,
  SECTION_LABEL_CLASS,
  ICON_BOX_PRIMARY_CLASS,
  FOCUS_RING_CLASS,
  MANAGEMENT_PAGE_SPACING,
} from "@/config/design";
import { ROUTES } from "@/config/constants";
import { useCategoriesQuery } from "@/hooks/use-categories";
import { useSubmissionCyclesQuery } from "@/hooks/use-submission-cycles";
import type { LucideIcon } from "lucide-react";

const QA_MANAGER_FUNCTIONS = [
  {
    href: ROUTES.QA_MANAGER_CATEGORIES,
    title: "Categories",
    description: "Manage categories for proposal classification.",
    icon: Tags,
  },
  {
    href: ROUTES.QA_MANAGER_SUBMISSION_CYCLES,
    title: "Submission cycles",
    description: "Create and manage proposal submission cycles.",
    icon: CalendarRange,
  },
] as const;

function QaManagerModuleLink({
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
      className={`group flex flex-col p-5 transition-all duration-200 hover:bg-primary/[0.03] hover:border-primary/30 hover:shadow-md hover:shadow-primary/[0.04] ${FOCUS_RING_CLASS} ${CARD_CLASS}`}
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
      <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary/70 transition-colors group-hover:text-primary">
        Manage
        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

function QaManagerSummary() {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: cycles = [] } = useSubmissionCyclesQuery();
  const activeCycle = cycles.find((c) => c.status === "ACTIVE");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={`px-5 py-4 ${CARD_STAT_CLASS}`}>
        <p className={SECTION_LABEL_CLASS}>Categories</p>
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-primary">
          {categories.length}
        </p>
      </div>
      <div className={`px-5 py-4 ${CARD_STAT_CLASS}`}>
        <p className={SECTION_LABEL_CLASS}>Active submission cycle</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
          {activeCycle?.name ?? "—"}
        </p>
      </div>
    </div>
  );
}

export function QaManagerDashboardContent() {
  return (
    <div className={MANAGEMENT_PAGE_SPACING}>
      <section aria-labelledby="qa-summary-heading">
        <h2 id="qa-summary-heading" className="sr-only">
          Summary
        </h2>
        <QaManagerSummary />
      </section>
      <section aria-labelledby="qa-modules-heading">
        <h2 id="qa-modules-heading" className={SECTION_LABEL_CLASS}>
          Management
        </h2>
        <nav
          className="mt-3 grid gap-4 sm:grid-cols-2"
          aria-label="QA Manager modules"
        >
          {QA_MANAGER_FUNCTIONS.map((item) => (
            <QaManagerModuleLink
              key={item.href}
              href={item.href}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </nav>
      </section>
    </div>
  );
}
