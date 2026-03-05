"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { TYPO_LABEL, TYPO_NAV, TYPO_HEADER_AND_STAT_TEXT, HOVER_TRANSITION_NAV, NAVBAR_ICON_SIZE } from "@/config/design";
import {
  PROFILE_AVATAR_FALLBACK_CLASS,
  BREADCRUMB_LINK_CLASS,
  BREADCRUMB_CURRENT_CLASS,
} from "@/components/features/admin/constants";
import { ROUTES } from "@/config/constants";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** Path segment to human-readable label. */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  users: "Users",
  departments: "Departments",
  department: "Department Members",
  "academic-years": "Academic Years",
  "qa-manager": "QA Manager",
  categories: "Categories",
  "submission-cycles": "Proposal Cycles",
  "proposal-cycles": "Proposal Cycles",
  "qa-coordinator": "QA Coordinator",
  ideas: "Ideas Hub",
  new: "New",
  my: "My Ideas",
  edit: "Edit",
  profile: "Profile",
};

/** Role badge shown in user menu. */
export function PrimaryRoleLabel({ roles }: { roles: string[] | undefined }) {
  if (!roles?.length) return null;
  const order: Role[] = ["ADMIN", "QA_MANAGER", "QA_COORDINATOR", "STAFF"];
  const primary = order.find((r) => roles.includes(r));
  return primary ? <span>{ROLE_LABELS[primary]}</span> : null;
}

export type BreadcrumbItem = { href: string; label: string; isContext?: boolean };

export function getBreadcrumbs(
  pathname: string,
  user?: { roles?: string[] }
): BreadcrumbItem[] {
  if (pathname === "/profile") {
    return [
      { href: "", label: "Account", isContext: true },
      { href: "/profile", label: "Profile" },
    ];
  }
  // QA Coordinator: /ideas/[id] → QA Coordinator > Ideas Hub > Proposal
  const isQaCoord =
    user?.roles?.some((r) => String(r).toUpperCase() === "QA_COORDINATOR");
  if (
    isQaCoord &&
    pathname.startsWith("/ideas/") &&
    !pathname.startsWith("/ideas/new") &&
    !pathname.startsWith("/ideas/my")
  ) {
    const segs = pathname.split("/").filter(Boolean);
    const id = segs[segs.length - 1];
    const isEdit = id === "edit" || segs[segs.length - 2] === "edit";
    return [
      { href: ROUTES.QA_COORDINATOR_DASHBOARD, label: "QA Coordinator" },
      { href: ROUTES.QA_COORDINATOR_IDEAS, label: "Ideas Hub" },
      { href: pathname, label: isEdit ? "Edit" : "Proposal" },
    ];
  }
  // QA Manager: /ideas/[id] → QA Manager > Ideas Hub > Proposal
  const isQaMgr =
    user?.roles?.some((r) => String(r).toUpperCase() === "QA_MANAGER");
  if (
    isQaMgr &&
    pathname.startsWith("/ideas/") &&
    !pathname.startsWith("/ideas/new") &&
    !pathname.startsWith("/ideas/my")
  ) {
    const segs = pathname.split("/").filter(Boolean);
    const id = segs[segs.length - 1];
    const isEdit = id === "edit" || segs[segs.length - 2] === "edit";
    return [
      { href: ROUTES.QA_MANAGER_DASHBOARD, label: "QA Manager" },
      { href: ROUTES.QA_MANAGER_IDEAS, label: "Ideas Hub" },
      { href: pathname, label: isEdit ? "Edit" : "Proposal" },
    ];
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  const items: BreadcrumbItem[] = [];
  let href = "";
  for (const seg of segments) {
    href += `/${seg}`;
    const label =
      SEGMENT_LABELS[seg] ??
      (seg.match(/^[0-9a-f-]{36}$/i)
        ? "Proposal"
        : seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    items.push({ href, label });
  }
  return items;
}

/** Shared icon button for top app bars — size-8, rounded-lg, cursor pointer. */
const HEADER_ICON_CLASS =
  `inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg ${HOVER_TRANSITION_NAV} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`;

export function HeaderIconButton({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
  pillGroup,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  /** When true (Staff pill group): softer active state to match pill container. */
  pillGroup?: boolean;
}) {
  const activeClass = isActive
    ? pillGroup
      ? "bg-primary/[0.05] text-primary"
      : "bg-muted/[0.05] text-primary"
    : "text-muted-foreground/55 hover:text-foreground/80";
  const content = (
    <span className={`flex items-center justify-center ${HEADER_ICON_CLASS} ${activeClass}`}>
      <Icon className={NAVBAR_ICON_SIZE} aria-hidden />
    </span>
  );

  const wrapped = href ? (
    <Link href={href} aria-label={label} aria-current={isActive ? "page" : undefined}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label}>
      {content}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/** Shared user menu dropdown. */
export function UserMenu({
  user,
  displayName,
  avatarInitial,
  onLogout,
  variant = "minimal",
}: {
  user: { roles?: string[] };
  displayName: string;
  avatarInitial: string;
  onLogout: () => Promise<void>;
  variant?: "minimal" | "pill";
}) {
  const isPill = variant === "pill";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            isPill
              ? `group flex cursor-pointer items-center gap-2 rounded-full bg-muted/[0.02] pl-1 pr-2 py-1 ${HOVER_TRANSITION_NAV} hover:bg-muted/[0.05] focus-visible:outline-none focus-visible:ring-0`
              : `group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 pr-2 ${HOVER_TRANSITION_NAV} hover:bg-muted/[0.03] focus-visible:outline-none focus-visible:ring-0`
          }
        >
          <Avatar className={isPill ? "size-8 shrink-0" : "shrink-0"}>
            <AvatarFallback className={`${PROFILE_AVATAR_FALLBACK_CLASS} text-xs font-semibold`}>
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left sm:block">
            <p
              className={`max-w-[140px] truncate font-medium leading-tight text-foreground ${
                isPill ? TYPO_NAV : `${TYPO_NAV} tracking-tight`
              }`}
            >
              {displayName}
            </p>
          </div>
          <ChevronDown
            className="hidden size-3.5 shrink-0 text-muted-foreground/60 transition-[color,transform] duration-200 group-hover:text-muted-foreground/80 group-data-[state=open]:rotate-180 sm:block"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 overflow-hidden p-0"
      >
        <div className="border-b border-border/40 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0 rounded-full">
              <AvatarFallback className={`${PROFILE_AVATAR_FALLBACK_CLASS} text-sm font-semibold`}>
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className={`truncate ${TYPO_NAV} font-semibold text-foreground/95`}>{displayName}</p>
              <span className={`inline-flex items-center rounded-md bg-primary/[0.08] px-1.5 py-0.5 ${TYPO_LABEL} text-primary/90`}>
                <PrimaryRoleLabel roles={user.roles} />
              </span>
            </div>
          </div>
        </div>
        <div className="p-1.5">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.PROFILE} className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${TYPO_NAV}`}>
              <Settings className="size-4 text-muted-foreground/80" aria-hidden />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            variant="destructive"
            onClick={onLogout}
            className={`rounded-md px-2.5 py-2 ${TYPO_NAV}`}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Top-bar breadcrumb — minimal, primary accent, subtle and distinctive. */
export function HeaderBreadcrumbs({
  pathname,
  user,
  getEntryRouteForRoles,
}: {
  pathname: string;
  user: { roles?: string[] };
  getEntryRouteForRoles: (roles: string[] | undefined) => string;
}) {
  const breadcrumbs = getBreadcrumbs(pathname, user);

  const linkClass = `${BREADCRUMB_LINK_CLASS} cursor-pointer rounded-sm py-0.5 text-muted-foreground/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${HOVER_TRANSITION_NAV}`;

  const currentOnly = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const parentItem = breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2] : null;
  const parentIsIdeasHub = parentItem?.label === "Ideas Hub";
  const mobileItems = parentIsIdeasHub && parentItem && currentOnly
    ? [parentItem, currentOnly]
    : currentOnly
      ? [currentOnly]
      : [];

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className={`flex min-w-0 flex-wrap items-center gap-1.5 font-sans text-muted-foreground ${TYPO_HEADER_AND_STAT_TEXT}`}>
        {breadcrumbs.length === 0 ? (
          <li>
            <Link
              href={getEntryRouteForRoles(user.roles)}
              className={linkClass}
            >
              Dashboard
            </Link>
          </li>
        ) : (
          <>
            {/* Mobile: current only, or Ideas Hub + Detail when that hierarchy exists */}
            <li className="flex min-w-0 items-center gap-1.5 sm:hidden">
              {mobileItems.map((item, i) => (
                <span key={item.href || i} className="flex min-w-0 items-center gap-1.5">
                  {i > 0 && (
                    <span className="shrink-0 text-muted-foreground/80" aria-hidden>/</span>
                  )}
                  {i < mobileItems.length - 1 && item.href ? (
                    <Link href={item.href} className={cn("min-w-0 truncate", linkClass)}>
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "min-w-0 truncate font-medium",
                        i === mobileItems.length - 1 && BREADCRUMB_CURRENT_CLASS
                      )}
                      aria-current={i === mobileItems.length - 1 ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </span>
              ))}
            </li>
            {/* Desktop: full breadcrumb */}
            {breadcrumbs.map((item, i) => (
              <li key={item.href || `ctx-${i}`} className="hidden items-center gap-1 sm:flex">
                {i > 0 && (
                  <span className="shrink-0 mx-0.5 text-muted-foreground/80" aria-hidden>
                    /
                  </span>
                )}
                {item.isContext ? (
                  <span className="truncate">
                    {item.label}
                  </span>
                ) : i < breadcrumbs.length - 1 ? (
                  <Link href={item.href} className={cn("truncate", linkClass)}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn("truncate font-medium", BREADCRUMB_CURRENT_CLASS)} aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </>
        )}
      </ol>
    </nav>
  );
}
