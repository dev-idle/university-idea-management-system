"use client";

import { usePathname } from "next/navigation";
import { Lightbulb, Menu } from "lucide-react";
import { getEntryRouteForRoles, ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { hasRole } from "@/lib/rbac";
import {
  NAVBAR_ACTION_GROUP,
  NAVBAR_DIVIDER_VERTICAL,
  NAVBAR_HEADER_CLASS,
  NAVBAR_LEFT_BASE,
  NAVBAR_RIGHT_BASE,
  NAVBAR_RIGHT_GAP,
} from "@/config/design";
import {
  HeaderBreadcrumbs,
  HeaderIconButton,
  UserMenu,
} from "@/components/layout/header-parts";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

interface NavbarHeaderProps {
  user: { roles?: string[] };
  displayName: string;
  avatarInitial: string;
  onLogout: () => Promise<void>;
  /** When provided, shows hamburger to open mobile nav drawer. */
  onOpenMobileMenu?: () => void;
}

/**
 * Management layout top bar: breadcrumbs, quick actions, user menu.
 * Compact, glass-effect, 2026-style.
 */
export function NavbarHeader({
  user,
  displayName,
  avatarInitial,
  onLogout,
  onOpenMobileMenu,
}: NavbarHeaderProps) {
  const pathname = usePathname();
  const showNotification = !hasRole(user.roles, "ADMIN") && !hasRole(user.roles, "QA_MANAGER");
  const hasLeftActions = hasRole(user.roles, "STAFF") || showNotification;

  return (
    <header className={NAVBAR_HEADER_CLASS}>
      <div className={NAVBAR_LEFT_BASE}>
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        )}
        <HeaderBreadcrumbs
          pathname={pathname}
          user={user}
          getEntryRouteForRoles={getEntryRouteForRoles}
        />
      </div>

      <div className={cn(NAVBAR_RIGHT_BASE, NAVBAR_RIGHT_GAP)}>
        {hasLeftActions && (
          <div className={NAVBAR_ACTION_GROUP}>
            {hasRole(user.roles, "STAFF") && (
              <HeaderIconButton
                icon={Lightbulb}
                label="Ideas Hub"
                href={ROUTES.IDEAS}
                isActive={pathname === ROUTES.IDEAS}
                pillGroup
              />
            )}
            {showNotification && <NotificationDropdown variant="pill" />}
          </div>
        )}

        {hasLeftActions && (
          <div className={NAVBAR_DIVIDER_VERTICAL} aria-hidden />
        )}

        <UserMenu
          user={user}
          displayName={displayName}
          avatarInitial={avatarInitial}
          onLogout={onLogout}
          variant="pill"
        />
      </div>
    </header>
  );
}
