"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Building2,
  CalendarDays,
  CalendarRange,
  Tags,
  Lightbulb,
  FolderPen,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfileQuery } from "@/hooks/use-profile";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
import { ROUTES, getEntryRouteForRoles, getPrimaryRole, isPathAllowedForRole } from "@/config/constants";
import { formatAcademicYearDisplay } from "@/lib/utils";

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
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingState } from "@/components/ui/loading-state";
import { cn, getAvatarInitial } from "@/lib/utils";
import {
  MAIN_BG,
  MAIN_MAX_W,
  MAIN_MAX_W_COLLAPSED,
  MAIN_PX,
  MAIN_PY,
  NAVBAR_DIVIDER_LEFT,
  NAVBAR_DIVIDER_VERTICAL,
  NAVBAR_HEADER_CLASS,
  NAVBAR_LEFT_BASE,
  NAVBAR_RIGHT_BASE,
  NAVBAR_RIGHT_GAP,
  STAFF_PILL_GROUP_CLASS,
  STAFF_MAIN_MAX_W,
  STAFF_CONTEXT_LABEL_CLASS,
  SIDEBAR_LABELS_EXPAND_DELAY_MS,
  SIDEBAR_BORDER,
  SIDEBAR_BORDER_INNER,
  SIDEBAR_SECTION_LABEL_CLASS,
  SIDEBAR_SECTION_DIVIDER,
  SIDEBAR_SECTION_MARGIN,
  SIDEBAR_SECTION_ROW,
  SIDEBAR_SECTION_INNER_GAP,
  SIDEBAR_COLLAPSED_SEP,
  SIDEBAR_COLLAPSED_SEP_HEIGHT,
  SIDEBAR_COLLAPSED_SEP_DOT,
  SIDEBAR_COLLAPSED_ICON_SIZE,
  SIDEBAR_COLLAPSED_HIT,
  SIDEBAR_NAV_INACTIVE,
  SIDEBAR_NAV_ICON_COLLAPSED,
  SIDEBAR_NAV_TEXT_INACTIVE,
  SIDEBAR_HOVER_BG,
  SIDEBAR_NAV_ACTIVE,
  SIDEBAR_NAV_PADDING,
  SIDEBAR_NAV_GAP,
  SIDEBAR_NAV_ITEM_GAP,
  SIDEBAR_NAV_ITEM_GAP_COLLAPSED,
  SIDEBAR_SCROLL_PT,
  SIDEBAR_SCROLL_PT_COLLAPSED,
  SIDEBAR_SCROLL_PB,
  SIDEBAR_SCROLL_PX,
  SIDEBAR_FOOTER_PADDING,
  SIDEBAR_FOOTER_BUTTON_PADDING,
  SIDEBAR_FOOTER_ICON,
  SIDEBAR_FOOTER_TEXT,
  SIDEBAR_ACTIVE_PILL,
  SIDEBAR_TOOLTIP_CLASS,
  SIDEBAR_TOOLTIP_OFFSET,
} from "@/config/design";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

/* ────────────────────────────────────────────────────────────────────────────
 * Sidebar components — consistent, modern, intuitive
 * ──────────────────────────────────────────────────────────────────────────── */

/** Section label — grid 0fr/2.5rem when expanded; collapsed = subtle dot separator for grouping. */
function SidebarSectionLabel({
  children,
  collapsed,
  isFirst,
}: {
  children: React.ReactNode;
  collapsed?: boolean;
  isFirst?: boolean;
}) {
  if (collapsed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center transition-opacity duration-150",
          SIDEBAR_COLLAPSED_SEP_HEIGHT,
          isFirst && "h-0 opacity-0"
        )}
        aria-hidden
      >
        <span className={cn("rounded-full", SIDEBAR_COLLAPSED_SEP_DOT, SIDEBAR_COLLAPSED_SEP)} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,margin-top] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        SIDEBAR_SECTION_ROW,
        isFirst ? "mt-0" : SIDEBAR_SECTION_MARGIN
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn("flex flex-col pt-px sidebar-label-fade-in", SIDEBAR_SECTION_INNER_GAP)}>
          <span className={cn("select-none px-4", SIDEBAR_SECTION_LABEL_CLASS)}>
            {children}
          </span>
          <span
            className={cn("mx-4 h-px shrink-0", SIDEBAR_SECTION_DIVIDER)}
            aria-hidden
          />
        </div>
      </div>
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
  const base = "group/nav relative flex items-center rounded-lg transition-colors duration-200 ease-out";
  const shapeStyle = collapsed
    ? `${SIDEBAR_COLLAPSED_HIT} shrink-0 justify-center p-2`
    : `w-full justify-start ${SIDEBAR_NAV_GAP} ${SIDEBAR_NAV_PADDING}`;
  const inactiveStyle = `cursor-pointer bg-transparent ${SIDEBAR_NAV_INACTIVE} ${SIDEBAR_HOVER_BG} hover:text-sidebar-accent-foreground`;
  const activeStyle = `cursor-pointer ${SIDEBAR_NAV_ACTIVE} text-primary`;
  const stateStyle = isActive ? activeStyle : inactiveStyle;

  const linkContent = (
    <Link
      href={href}
      className={cn(base, shapeStyle, stateStyle)}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
    >
      {isActive && !collapsed && (
        <motion.div
          layoutId="active-pill"
          className={SIDEBAR_ACTIVE_PILL}
          transition={{
            type: "tween",
            duration: 0.22,
            ease: [0.32, 0.72, 0, 1],
          }}
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          "shrink-0",
          collapsed ? SIDEBAR_COLLAPSED_ICON_SIZE : "size-4",
          isActive ? "text-primary" : collapsed ? SIDEBAR_NAV_ICON_COLLAPSED : SIDEBAR_NAV_INACTIVE
        )}
        aria-hidden
      />
      {!collapsed && (
        <span
          className={cn(
            "truncate text-sm",
            isActive ? "font-medium text-primary" : ["font-normal", SIDEBAR_NAV_TEXT_INACTIVE]
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={SIDEBAR_TOOLTIP_OFFSET} className={SIDEBAR_TOOLTIP_CLASS}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

function SidebarNav({ collapsed, labelsCollapsed }: { collapsed: boolean; labelsCollapsed: boolean }) {
  const user = useAuth().user;
  const pathname = usePathname();

  if (!user?.roles?.length) return null;

  const items: ReactNode[] = [];
  if (hasRole(user.roles, "ADMIN")) {
    items.push(
      <SidebarSectionLabel key="mgmt-label" collapsed={labelsCollapsed} isFirst>
        Administration
      </SidebarSectionLabel>
    );
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
      <Can key="dept-members" permission="DEPARTMENTS">
        <NavLink
          href={ROUTES.ADMIN_DEPARTMENT_MEMBERS}
          label="Department Members"
          icon={UsersRound}
          isActive={pathname === ROUTES.ADMIN_DEPARTMENT_MEMBERS}
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
    items.push(
      <SidebarSectionLabel
        key="qa-label"
        collapsed={labelsCollapsed}
        isFirst={!hasRole(user.roles, "ADMIN")}
      >
        Institutional QA
      </SidebarSectionLabel>
    );
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
        key={ROUTES.QA_MANAGER_PROPOSAL_CYCLES}
        href={ROUTES.QA_MANAGER_PROPOSAL_CYCLES}
        label="Proposal Cycles"
        icon={CalendarRange}
        isActive={pathname === ROUTES.QA_MANAGER_PROPOSAL_CYCLES}
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.QA_MANAGER_IDEAS}
        href={ROUTES.QA_MANAGER_IDEAS}
        label="Ideas Hub"
        icon={Lightbulb}
        isActive={
          pathname === ROUTES.QA_MANAGER_IDEAS ||
          (pathname.startsWith(`${ROUTES.IDEAS}/`) && !pathname.startsWith(ROUTES.MY_IDEAS))
        }
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.QA_MANAGER_EXPORT}
        href={ROUTES.QA_MANAGER_EXPORT}
        label="Export Data"
        icon={Download}
        isActive={pathname === ROUTES.QA_MANAGER_EXPORT}
        collapsed={collapsed}
      />
    );
  }
  if (hasRole(user.roles, "QA_COORDINATOR")) {
    items.push(
      <SidebarSectionLabel
        key="qa-coord-label"
        collapsed={labelsCollapsed}
        isFirst={!hasRole(user.roles, "ADMIN") && !hasRole(user.roles, "QA_MANAGER")}
      >
        Departmental QA
      </SidebarSectionLabel>
    );
    items.push(
      <NavLink
        key={ROUTES.QA_COORDINATOR_DASHBOARD}
        href={ROUTES.QA_COORDINATOR_DASHBOARD}
        label="Dashboard"
        icon={LayoutDashboard}
        isActive={pathname === ROUTES.QA_COORDINATOR_DASHBOARD}
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.QA_COORDINATOR_DEPARTMENT}
        href={ROUTES.QA_COORDINATOR_DEPARTMENT}
        label="Department Members"
        icon={UsersRound}
        isActive={pathname === ROUTES.QA_COORDINATOR_DEPARTMENT}
        collapsed={collapsed}
      />
    );
    items.push(
      <NavLink
        key={ROUTES.QA_COORDINATOR_IDEAS}
        href={ROUTES.QA_COORDINATOR_IDEAS}
        label="Ideas Hub"
        icon={Lightbulb}
        isActive={
          pathname === ROUTES.QA_COORDINATOR_IDEAS ||
          (pathname.startsWith(`${ROUTES.IDEAS}/`) && !pathname.startsWith(ROUTES.MY_IDEAS))
        }
        collapsed={collapsed}
      />
    );
  }
  if (hasRole(user.roles, "STAFF")) {
    items.push(
      <SidebarSectionLabel
        key="ideas-label"
        collapsed={labelsCollapsed}
        isFirst={
          !hasRole(user.roles, "ADMIN") &&
          !hasRole(user.roles, "QA_MANAGER") &&
          !hasRole(user.roles, "QA_COORDINATOR")
        }
      >
        Ideas
      </SidebarSectionLabel>
    );
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
        className={cn(
          "flex flex-col",
          collapsed ? `items-center ${SIDEBAR_NAV_ITEM_GAP_COLLAPSED} px-0` : `${SIDEBAR_NAV_ITEM_GAP} ${SIDEBAR_SCROLL_PX}`
        )}
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
  const [labelsExpanded, setLabelsExpanded] = useState(true);
  const justExpandedRef = useRef(false);

  const displayName = profile?.fullName?.trim() || user?.email || "";
  const avatarInitial = getAvatarInitial(profile?.fullName ?? null, user?.email ?? "");

  // Sync labels: collapse immediately; expand after delay only when user clicks Expand (avoids text reflow jump)
  useEffect(() => {
    if (sidebarCollapsed) {
      justExpandedRef.current = false;
      queueMicrotask(() => setLabelsExpanded(false));
      return;
    }
    if (!justExpandedRef.current) {
      queueMicrotask(() => setLabelsExpanded(true));
      return;
    }
    const t = setTimeout(() => setLabelsExpanded(true), SIDEBAR_LABELS_EXPAND_DELAY_MS);
    return () => clearTimeout(t);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored === "true") {
      const id = requestAnimationFrame(() => {
        setSidebarCollapsed(true);
        setLabelsExpanded(false);
      });
      return () => cancelAnimationFrame(id);
    }
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (!next) justExpandedRef.current = true;
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
    return <LoadingState fullScreen />;
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
        className={cn(
          "flex h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
          SIDEBAR_BORDER,
          sidebarCollapsed ? "w-16 items-center md:w-20" : "w-64 md:w-[272px]"
        )}
      >
        <SidebarHeader collapsed={sidebarCollapsed} />
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto scrollbar-hide-stable",
            SIDEBAR_SCROLL_PB,
            sidebarCollapsed
              ? `flex w-full flex-col items-center ${SIDEBAR_NAV_ITEM_GAP_COLLAPSED} ${SIDEBAR_SCROLL_PT_COLLAPSED}`
              : SIDEBAR_SCROLL_PT
          )}
        >
          <SidebarNav collapsed={sidebarCollapsed} labelsCollapsed={sidebarCollapsed || !labelsExpanded} />
        </div>
        {/* ── Footer: Collapse toggle ───────────────────────────────────────── */}
        <div
          className={cn(
            "shrink-0 border-t bg-sidebar",
            SIDEBAR_FOOTER_PADDING,
            SIDEBAR_BORDER_INNER,
            sidebarCollapsed && "flex justify-center"
          )}
        >
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  `flex cursor-pointer items-center gap-2 rounded-lg transition-colors duration-200 ease-out ${SIDEBAR_HOVER_BG} hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2`,
                  sidebarCollapsed
                    ? `${SIDEBAR_COLLAPSED_HIT} justify-center p-0 ${SIDEBAR_FOOTER_ICON}`
                    : `w-full ${SIDEBAR_FOOTER_BUTTON_PADDING} ${SIDEBAR_FOOTER_TEXT}`
                )}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className={`${SIDEBAR_COLLAPSED_ICON_SIZE} shrink-0`} strokeWidth={1.5} aria-hidden />
                ) : (
                  <>
                    <PanelLeftClose className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    <span className="truncate text-xs font-normal tracking-wide">
                      Collapse
                    </span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={SIDEBAR_TOOLTIP_OFFSET} className={SIDEBAR_TOOLTIP_CLASS}>
              {sidebarCollapsed ? "Expand" : "Collapse"}
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
        <main
          className={cn(
            "scrollbar-hide-stable min-h-0 min-w-0 flex-1 overflow-x-visible overflow-y-auto",
            MAIN_BG,
            MAIN_PX,
            MAIN_PY
          )}
        >
          <div
            className={cn(
              "mx-auto w-full transition-[max-width] duration-300 ease-in-out",
              sidebarCollapsed ? MAIN_MAX_W_COLLAPSED : MAIN_MAX_W
            )}
          >
            <div>{children}</div>
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
  const contextLabel =
    context?.activeCycleName ??
    (context?.activeAcademicYear?.name
      ? formatAcademicYearDisplay(context.activeAcademicYear.name)
      : null) ??
    String(new Date().getFullYear());
  const isIdeasPage = pathname === ROUTES.IDEAS;
  const isMyIdeasPage = pathname.startsWith(ROUTES.MY_IDEAS);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header
        className={NAVBAR_HEADER_CLASS}
      >
        <div className={cn(NAVBAR_LEFT_BASE, "gap-4")}>
          <SiteBranding variant="header" linkToEntry />
          <div className={NAVBAR_DIVIDER_LEFT} aria-hidden />
          <span
            className={cn("truncate", STAFF_CONTEXT_LABEL_CLASS)}
            title={contextLabel}
          >
            {contextLabel}
          </span>
        </div>
        <div className={cn(NAVBAR_RIGHT_BASE, NAVBAR_RIGHT_GAP)}>
          <div className={STAFF_PILL_GROUP_CLASS}>
            <HeaderIconButton
              icon={Lightbulb}
              label="Ideas Hub"
              href={ROUTES.IDEAS}
              isActive={isIdeasPage}
              pillGroup
            />
            <HeaderIconButton
              icon={FolderPen}
              label="My Ideas"
              href={ROUTES.MY_IDEAS}
              isActive={isMyIdeasPage}
              pillGroup
            />
            <NotificationDropdown variant="pill" />
          </div>
          <div className={NAVBAR_DIVIDER_VERTICAL} aria-hidden />
          <UserMenu
            user={user}
            displayName={displayName}
            avatarInitial={avatarInitial}
            onLogout={onLogout}
            variant="pill"
          />
        </div>
      </header>
      <main
        className={cn(
          "scrollbar-hide-stable min-h-0 min-w-0 flex-1 overflow-x-visible overflow-y-auto",
          MAIN_BG,
          MAIN_PX,
          MAIN_PY
        )}
      >
        <div
          className={cn(
            "mx-auto w-full transition-[max-width] duration-300 ease-in-out",
            STAFF_MAIN_MAX_W
          )}
        >
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
