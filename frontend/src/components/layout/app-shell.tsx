"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
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
  FolderPen,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
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

import { hasRole } from "@/lib/rbac";
import { Can } from "@/components/ui/can";
import { SiteBranding } from "@/components/layout/site-branding";
import { SidebarHeader } from "@/components/layout/sidebar-header";
import { NavbarHeader } from "@/components/layout/navbar-header";
import { HeaderIconButton, UserMenu } from "@/components/layout/header-parts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAvatarInitial } from "@/lib/utils";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

/* ────────────────────────────────────────────────────────────────────────────
 * Sidebar components — consistent, modern, intuitive
 * ──────────────────────────────────────────────────────────────────────────── */

/** Section label — distinct header, separated from menu items. */
function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex flex-col gap-2 first:mt-0">
      <span className="select-none px-4 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
        {children}
      </span>
      <span
        className="mx-4 h-px shrink-0 bg-sidebar-border/70"
        aria-hidden
      />
    </div>
  );
}

/**
 * Sidebar nav link — Minimal, comfortable. Active indicator slides on navigation.
 */
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
  const base = "group/nav relative flex items-center transition-colors duration-150";
  const shapeStyle = collapsed
    ? "size-9 shrink-0 justify-center rounded-lg p-2"
    : "w-full justify-start gap-3 rounded-lg pl-4 pr-4 py-2.5";
  const inactiveStyle =
    "cursor-pointer bg-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground";
  const activeStyle =
    "cursor-pointer bg-primary/[0.05] text-primary ring-1 ring-primary/10";
  const stateStyle = isActive ? activeStyle : inactiveStyle;

  const linkContent = (
    <Link
      href={href}
      className={`${base} ${shapeStyle} ${stateStyle}`}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
    >
      {isActive && !collapsed && (
        <motion.div
          layoutId="active-pill"
          className="absolute left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary"
          transition={{
            type: "tween",
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          aria-hidden
        />
      )}
      <Icon
        className={`size-4 shrink-0 opacity-90 ${isActive ? "text-primary" : "text-sidebar-foreground/60"}`}
        aria-hidden
      />
      {!collapsed && (
        <span className={`truncate text-sm ${isActive ? "font-medium text-primary" : "font-normal text-sidebar-foreground/90"}`}>
          {label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="rounded-xl border border-border/50 px-3 py-2 text-xs font-medium shadow-xl backdrop-blur-sm">
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
        <SidebarSectionLabel key="mgmt-label">Administration</SidebarSectionLabel>
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
          label="Academic Years"
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
        <SidebarSectionLabel key="qa-label">Quality Assurance</SidebarSectionLabel>
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
        <SidebarSectionLabel key="qa-coord-label">Quality Assurance</SidebarSectionLabel>
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
        label="Ideas Hub"
        icon={Lightbulb}
        isActive={pathname === ROUTES.IDEAS}
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.MY_IDEAS}
        href={ROUTES.MY_IDEAS}
        label="My Ideas"
        icon={FolderPen}
        isActive={pathname.startsWith(ROUTES.MY_IDEAS)}
        collapsed={collapsed}
      />
    );
  }

  return (
    <LayoutGroup id="sidebar-nav">
      <nav
        className={`flex flex-col gap-2 ${collapsed ? "items-center px-0" : "px-3"}`}
        aria-label="Main"
      >
        {items}
      </nav>
    </LayoutGroup>
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

  /* ── Management layout: [ Sidebar (full-height) | Content (Navbar + Main) ] ─ */
  return (
    <div
      className="flex h-screen overflow-hidden bg-background"
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
    >
      {/* ── Sidebar: flex flex-col h-screen — Logo | Menu | Footer ───────────── */}
      <aside
        className={`flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarCollapsed ? "w-full items-center md:w-20" : "w-full md:w-[272px]"
        }`}
      >
        <SidebarHeader collapsed={sidebarCollapsed} />
        <div
          className={`min-h-0 flex-1 overflow-y-auto pt-5 pb-6 ${sidebarCollapsed ? "flex w-full flex-col items-center" : ""}`}
        >
          <SidebarNav collapsed={sidebarCollapsed} />
        </div>
        {/* ── Footer: Collapse toggle ───────────────────────────────────────── */}
        <div
          className={`shrink-0 border-t border-sidebar-border/80 bg-sidebar px-3 py-4 ${sidebarCollapsed ? "flex justify-center" : ""}`}
        >
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebar}
                className={`flex cursor-pointer items-center gap-2 rounded-lg text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 ${
                  sidebarCollapsed ? "size-9 justify-center p-0" : "w-full px-3 py-2"
                }`}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                ) : (
                  <>
                    <PanelLeftClose className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    <span className="truncate text-xs font-normal text-sidebar-foreground/50">
                      Collapse
                    </span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={10}
              className="rounded-xl border border-border/50 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-sm"
            >
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* ── Content area: Sticky Navbar + scrollable Main ─────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <NavbarHeader
          user={user}
          displayName={displayName}
          avatarInitial={avatarInitial}
          onLogout={handleLogout}
        />
        <main className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto bg-background px-5 py-8 md:px-10 md:py-12 lg:px-12 lg:py-14">
          <div
            className={`mx-auto w-full transition-[max-width] duration-300 ease-in-out ${
              sidebarCollapsed ? "max-w-screen-2xl" : "max-w-[90rem]"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Staff-only: compact top bar (branding, context, quick nav, user). No sidebar. */
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
  const isMyIdeasPage = pathname.startsWith(ROUTES.MY_IDEAS);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SiteBranding variant="header" linkToEntry />
          {activeYearName && (
            <>
              <div className="h-4 w-px shrink-0 bg-border/40" aria-hidden />
              <span className="truncate text-sm text-muted-foreground/70" title={activeYearName}>
                {activeYearName}
              </span>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <div className="flex items-center rounded-lg bg-muted/20 p-0.5">
            <HeaderIconButton
              icon={Lightbulb}
              label="Ideas Hub"
              href={ROUTES.IDEAS}
              isActive={isIdeasPage}
            />
            <HeaderIconButton
              icon={FolderPen}
              label="My Ideas"
              href={ROUTES.MY_IDEAS}
              isActive={isMyIdeasPage}
            />
            <HeaderIconButton icon={Bell} label="Notifications" />
          </div>
          <div className="mx-2 h-5 w-px bg-border/60" aria-hidden />
          <UserMenu
            user={user}
            displayName={displayName}
            avatarInitial={avatarInitial}
            onLogout={onLogout}
            variant="pill"
          />
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
