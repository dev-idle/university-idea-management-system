"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Tags,
  Lightbulb,
  Bell,
  ChevronDown,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  User,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfileQuery } from "@/hooks/use-profile";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
import { ROUTES, getEntryRouteForRoles, getPrimaryRole, isPathAllowedForRole } from "@/config/constants";

/** True when user has only STAFF (no management roles). Staff get minimal top bar, no sidebar. */
function isStaffOnly(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  const upper = roles.map((r) => String(r).trim().toUpperCase());
  const hasStaff = upper.includes("STAFF");
  const hasManagement =
    upper.includes("ADMIN") || upper.includes("QA_MANAGER") || upper.includes("QA_COORDINATOR");
  return hasStaff && !hasManagement;
}

/** Page title for main header (pathname → label). Used only for management layout. */
const PATH_TO_TITLE: Record<string, string> = {
  [ROUTES.ADMIN_DASHBOARD]: "Dashboard",
  [ROUTES.ADMIN_USERS]: "Users Management",
  [ROUTES.ADMIN_DEPARTMENTS]: "Departments Management",
  [ROUTES.ADMIN_ACADEMIC_YEARS]: "Academic Years Management",
  [ROUTES.QA_MANAGER_DASHBOARD]: "Dashboard",
  [ROUTES.QA_MANAGER_CATEGORIES]: "Categories Management",
  [ROUTES.QA_MANAGER_SUBMISSION_CYCLES]: "Submission Cycles Management",
  [ROUTES.QA_COORDINATOR_DASHBOARD]: "QA Coordinator",
  [ROUTES.IDEAS]: "Ideas",
  [ROUTES.PROFILE]: "Profile",
};

import { ROLE_LABELS, hasRole, type Role } from "@/lib/rbac";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteBranding } from "@/components/layout/site-branding";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarInitial } from "@/lib/utils";

function PageTitle({
  pathname,
  onGoBack,
}: {
  pathname: string;
  onGoBack: () => void;
}) {
  const title = PATH_TO_TITLE[pathname] ?? "Dashboard";
  return (
    <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-primary">
      <button
        type="button"
        onClick={onGoBack}
        className="rounded text-left font-inherit focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={`${title}. Click to go back to ${pathname}`}
      >
        {title}
      </button>
    </h1>
  );
}

function PrimaryRoleLabel({ roles }: { roles: string[] | undefined }) {
  if (!roles?.length) return null;
  const order: Role[] = ["ADMIN", "QA_MANAGER", "QA_COORDINATOR", "STAFF"];
  const primary = order.find((r) => roles.includes(r));
  return primary ? <span>{ROLE_LABELS[primary]}</span> : null;
}

const SIDEBAR_COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

/** Section label above a group of nav items (expanded only). */
function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-5 first:mt-0 px-1">
      <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/90">
        {children}
      </span>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed?: boolean;
}) {
  const linkContent = (
    <Link
      href={href}
      className={`flex items-center text-sm font-medium transition-[color,background,border-color] duration-200 ease-out ${
        collapsed
          ? "size-9 w-full justify-center rounded-lg"
          : "h-10 w-full justify-start gap-3 rounded-r-lg border-l-2 py-2 pr-3 pl-[calc(0.75rem+2px)]"
      } ${
        collapsed
          ? isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          : isActive
            ? "border-primary bg-primary/8 text-foreground"
            : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const user = useAuth().user;
  const pathname = usePathname();

  if (!user?.roles?.length) return null;

  const items: ReactNode[] = [];
  if (hasRole(user.roles, "ADMIN")) {
    if (!collapsed) {
      items.push(
        <SidebarSectionLabel key="mgmt-label">Management</SidebarSectionLabel>
      );
    }
    items.push(
      <NavLink
        key={ROUTES.ADMIN_DASHBOARD}
        href={ROUTES.ADMIN_DASHBOARD}
        label="Dashboard"
        icon={LayoutDashboard}
        isActive={pathname === ROUTES.ADMIN_DASHBOARD}
        collapsed={collapsed}
      />
    );
    items.push(
      <Can key="users" permission="USERS">
        <NavLink
          href={ROUTES.ADMIN_USERS}
          label="Users"
          icon={Users}
          isActive={pathname === ROUTES.ADMIN_USERS}
          collapsed={collapsed}
        />
      </Can>
    );
    items.push(
      <Can key="depts" permission="DEPARTMENTS">
        <NavLink
          href={ROUTES.ADMIN_DEPARTMENTS}
          label="Departments"
          icon={Building2}
          isActive={pathname === ROUTES.ADMIN_DEPARTMENTS}
          collapsed={collapsed}
        />
      </Can>
    );
    items.push(
      <Can key="years" permission="ACADEMIC_YEARS">
        <NavLink
          href={ROUTES.ADMIN_ACADEMIC_YEARS}
          label="Academic years"
          icon={CalendarDays}
          isActive={pathname === ROUTES.ADMIN_ACADEMIC_YEARS}
          collapsed={collapsed}
        />
      </Can>
    );
  }
  if (hasRole(user.roles, "QA_MANAGER")) {
    if (!collapsed) {
      items.push(
        <SidebarSectionLabel key="qa-label">Quality assurance</SidebarSectionLabel>
      );
    }
    items.push(
      <NavLink
        key={ROUTES.QA_MANAGER_DASHBOARD}
        href={ROUTES.QA_MANAGER_DASHBOARD}
        label="Dashboard"
        icon={LayoutDashboard}
        isActive={pathname === ROUTES.QA_MANAGER_DASHBOARD}
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.QA_MANAGER_CATEGORIES}
        href={ROUTES.QA_MANAGER_CATEGORIES}
        label="Categories"
        icon={Tags}
        isActive={pathname === ROUTES.QA_MANAGER_CATEGORIES}
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.QA_MANAGER_SUBMISSION_CYCLES}
        href={ROUTES.QA_MANAGER_SUBMISSION_CYCLES}
        label="Submission Cycles"
        icon={CalendarRange}
        isActive={pathname === ROUTES.QA_MANAGER_SUBMISSION_CYCLES}
        collapsed={collapsed}
      />
    );
  }
  if (hasRole(user.roles, "QA_COORDINATOR")) {
    if (!collapsed) {
      items.push(
        <SidebarSectionLabel key="qa-coord-label">Quality assurance</SidebarSectionLabel>
      );
    }
    items.push(
      <NavLink
        key={ROUTES.QA_COORDINATOR_DASHBOARD}
        href={ROUTES.QA_COORDINATOR_DASHBOARD}
        label="QA Coordinator"
        icon={ClipboardList}
        isActive={pathname === ROUTES.QA_COORDINATOR_DASHBOARD}
        collapsed={collapsed}
      />
    );
  }
  if (hasRole(user.roles, "STAFF")) {
    if (!collapsed) {
      items.push(
        <SidebarSectionLabel key="ideas-label">Ideas</SidebarSectionLabel>
      );
    }
    items.push(
      <NavLink
        key={ROUTES.IDEAS}
        href={ROUTES.IDEAS}
        label="Ideas"
        icon={Lightbulb}
        isActive={pathname === ROUTES.IDEAS}
        collapsed={collapsed}
      />
    );
  }

  return (
    <nav
      className={`flex flex-col gap-0.5 pb-6 ${collapsed ? "px-2" : "px-3"}`}
      aria-label="Main"
    >
      {items}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: profile } = useProfileQuery();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const displayName = profile?.fullName?.trim() || user?.email || "";
  const avatarInitial = getAvatarInitial(profile?.fullName ?? null, user?.email ?? "");

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored === "true") {
      const id = requestAnimationFrame(() => setSidebarCollapsed(true));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    const primaryRole = getPrimaryRole(user?.roles);
    if (primaryRole && !isPathAllowedForRole(pathname, primaryRole)) {
      router.replace(getEntryRouteForRoles(user?.roles));
    }
  }, [isAuthenticated, user?.roles, pathname, router]);

  async function handleLogout() {
    await logout();
    queryClient.clear();
    router.replace(ROUTES.LOGIN);
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const staffOnly = isStaffOnly(user.roles);

  if (staffOnly) {
    return (
      <StaffLayout
        user={user}
        displayName={displayName}
        avatarInitial={avatarInitial}
        onLogout={handleLogout}
      >
        {children}
      </StaffLayout>
    );
  }

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-background md:flex-row"
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
    >
      <aside
        className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-border/70 transition-[width] duration-300 ease-in-out ${
          sidebarCollapsed
            ? "w-full md:min-w-0 md:w-[4.25rem] bg-muted/25"
            : "w-full md:w-64 bg-muted/20"
        }`}
      >
        <div
          className={`flex shrink-0 flex-col items-stretch border-b border-border/40 py-5 md:py-6 transition-[padding] duration-300 ease-in-out ${
            sidebarCollapsed ? "px-0" : "px-4"
          }`}
        >
          <SiteBranding variant="sidebar" linkToEntry collapsed={sidebarCollapsed} />
        </div>
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto py-4 transition-opacity duration-300 ease-in-out">
          <SidebarNav collapsed={sidebarCollapsed} />
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out">
        <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between gap-4 overflow-hidden border-b border-border bg-card px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-md text-primary hover:bg-primary/10"
                  onClick={toggleSidebar}
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? (
                    <PanelLeft className="size-4" aria-hidden />
                  ) : (
                    <PanelLeftClose className="size-4" aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
            <div className="h-4 w-px shrink-0 bg-border" aria-hidden />
            <PageTitle pathname={pathname} onGoBack={() => router.push(pathname)} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {user && (
              <>
                {hasRole(user.roles, "STAFF") && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={ROUTES.IDEAS}
                        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          pathname === ROUTES.IDEAS
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                        aria-label="Ideas Hub"
                        aria-current={pathname === ROUTES.IDEAS ? "page" : undefined}
                      >
                        <Lightbulb className="size-4" aria-hidden />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      Ideas Hub
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      aria-label="Notifications"
                    >
                      <Bell className="size-4" aria-hidden />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>
                    Notifications
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-2 rounded-lg border border-transparent pl-2 pr-2.5 font-normal text-muted-foreground transition-colors hover:border-border/60 hover:bg-primary/10 hover:text-primary focus-visible:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/20"
                    >
                      <Avatar className="size-7 shrink-0 rounded-full border border-border/80 bg-muted/50 ring-1 ring-border/40">
                        <AvatarFallback className="bg-muted/70 text-muted-foreground text-xs font-medium">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="max-w-[120px] truncate text-left text-sm sm:max-w-[180px]"
                        title={displayName}
                      >
                        {displayName}
                      </span>
                      <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/70 shadow-xl" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0 rounded-full border border-border/80 bg-muted/50 ring-1 ring-border/50">
                          <AvatarFallback className="bg-muted/70 text-muted-foreground text-sm font-medium">
                            {avatarInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                          <span className="truncate text-sm font-semibold tracking-tight text-foreground">{displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            <PrimaryRoleLabel roles={user.roles} />
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE} className="flex items-center gap-2">
                        <User className="size-4" aria-hidden />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                      <LogOut className="size-4" aria-hidden />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </header>
        <main className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto bg-background px-4 py-8 md:px-6 md:py-10 lg:px-10 lg:py-12">
          <div
            className={`mx-auto w-full transition-[max-width] duration-300 ease-in-out ${
              sidebarCollapsed ? "max-w-screen-2xl" : "max-w-7xl"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Staff-only: minimal top bar (branding, active academic year, avatar). No sidebar. */
function StaffLayout({
  user,
  displayName,
  avatarInitial,
  onLogout,
  children,
}: {
  user: { roles?: string[] };
  displayName: string;
  avatarInitial: string;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: context } = useIdeasContextQuery({ enabled: true });
  const activeYearName = context?.activeAcademicYear?.name ?? null;
  const isIdeasPage = pathname === ROUTES.IDEAS;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between gap-4 overflow-hidden border-b border-border bg-card px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <SiteBranding variant="header" linkToEntry />
          {activeYearName && (
            <>
              <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
              <span className="text-sm text-muted-foreground truncate" title={activeYearName}>
                {activeYearName}
              </span>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={ROUTES.IDEAS}
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isIdeasPage
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
                aria-label="Ideas Hub"
                aria-current={isIdeasPage ? "page" : undefined}
              >
                <Lightbulb className="size-4" aria-hidden />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              Ideas Hub
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label="Notifications"
              >
                <Bell className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              Notifications
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 rounded-lg border border-transparent pl-2 pr-2.5 font-normal text-muted-foreground transition-colors hover:border-border/60 hover:bg-primary/10 hover:text-primary focus-visible:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/20"
              >
                <Avatar className="size-7 shrink-0 rounded-full border border-border/80 bg-muted/50 ring-1 ring-border/40">
                  <AvatarFallback className="bg-muted/70 text-muted-foreground text-xs font-medium">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="max-w-[120px] truncate text-left text-sm sm:max-w-[180px]"
                  title={displayName}
                >
                  {displayName}
                </span>
                <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/70 shadow-xl" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 shrink-0 rounded-full border border-border/80 bg-muted/50 ring-1 ring-border/50">
                    <AvatarFallback className="bg-muted/70 text-muted-foreground text-sm font-medium">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold tracking-tight text-foreground">{displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      <PrimaryRoleLabel roles={user.roles} />
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.PROFILE} className="flex items-center gap-2">
                  <User className="size-4" aria-hidden />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                <LogOut className="size-4" aria-hidden />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto bg-background px-4 py-8 md:px-6 md:py-10 lg:px-10 lg:py-12">
        <div className="mx-auto w-full max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
