"use client";

import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { TYPO_LABEL, TYPO_NAV, HOVER_TRANSITION_NAV } from "@/config/design";
import { PROFILE_AVATAR_FALLBACK_CLASS } from "@/components/features/admin/constants";
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
  "academic-years": "Academic Years",
  "qa-manager": "QA Manager",
  categories: "Categories",
  "submission-cycles": "Proposal Cycles",
  "proposal-cycles": "Proposal Cycles",
  "qa-coordinator": "QA Coordinator",
  ideas: "Ideas",
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

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/profile") {
    return [
      { href: "", label: "Account", isContext: true },
      { href: "/profile", label: "Profile" },
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
        ? "Detail"
        : seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    items.push({ href, label });
  }
  return items;
}

/** Shared icon button for top app bars — size-8, rounded-lg. */
const HEADER_ICON_CLASS =
  `inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${HOVER_TRANSITION_NAV} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`;

export function HeaderIconButton({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const activeClass = isActive ? "bg-background/80 text-primary shadow-[var(--shadow-card-subtle)]" : "text-muted-foreground/65 hover:text-foreground/90";
  const content = (
    <span className={`flex items-center justify-center ${HEADER_ICON_CLASS} ${activeClass}`}>
      <Icon className="size-4" aria-hidden />
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
              ? `group flex items-center gap-2.5 rounded-full border border-border/50 bg-muted/[0.04] pl-1 pr-2.5 py-1 ${HOVER_TRANSITION_NAV} hover:border-border/60 hover:bg-muted/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:border-transparent`
              : `group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 pr-2 ${HOVER_TRANSITION_NAV} hover:bg-muted/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`
          }
        >
          <Avatar className={isPill ? "size-7 shrink-0" : "shrink-0"}>
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
            className="size-3.5 shrink-0 text-muted-foreground/60 transition-[color,transform] duration-200 group-hover:text-muted-foreground/80 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 overflow-hidden rounded-xl border border-border/55 bg-popover p-0 shadow-[var(--shadow-dialog)]"
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
        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.PROFILE} className={`flex items-center gap-2 rounded-md px-3 py-2 ${TYPO_NAV}`}>
              <Settings className="size-4 text-muted-foreground/80" aria-hidden />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            variant="destructive"
            onClick={onLogout}
            className={`rounded-md px-3 py-2 ${TYPO_NAV}`}
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
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 font-sans text-[15px]">
        {breadcrumbs.length === 0 ? (
          <li>
            <Link
              href={getEntryRouteForRoles(user.roles)}
              className={`rounded-sm py-0.5 text-muted-foreground/72 ${HOVER_TRANSITION_NAV} hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`}
            >
              Dashboard
            </Link>
          </li>
        ) : (
          breadcrumbs.map((item, i) => (
            <li key={item.href || `ctx-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <span
                  className="shrink-0 text-primary/25"
                  aria-hidden
                >
                  /
                </span>
              )}
              {item.isContext ? (
                <span className="truncate text-muted-foreground/65">
                  {item.label}
                </span>
              ) : i < breadcrumbs.length - 1 ? (
                <Link
                  href={item.href}
                  className={`truncate rounded-sm py-0.5 text-muted-foreground/75 ${HOVER_TRANSITION_NAV} hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="truncate font-medium text-primary/90"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))
        )}
      </ol>
    </nav>
  );
}
