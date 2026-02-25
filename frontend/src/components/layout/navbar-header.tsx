"use client";

import { usePathname } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { getEntryRouteForRoles, ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { hasRole } from "@/lib/rbac";
import {
  NAVBAR_ACTION_GROUP,
  NAVBAR_BORDER,
  NAVBAR_BG,
  NAVBAR_DIVIDER_VERTICAL,
  NAVBAR_HEADER_BASE,
  NAVBAR_PX,
  NAVBAR_RIGHT_GAP,
  STAFF_HEADER_HEIGHT,
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
}: NavbarHeaderProps) {
  const pathname = usePathname();
  const showNotification = !hasRole(user.roles, "ADMIN") && !hasRole(user.roles, "QA_MANAGER");
  const hasLeftActions = hasRole(user.roles, "STAFF") || showNotification;

  return (
    <header
      className={cn(
        NAVBAR_HEADER_BASE,
        STAFF_HEADER_HEIGHT,
        NAVBAR_PX,
        NAVBAR_BG,
        NAVBAR_BORDER
      )}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <HeaderBreadcrumbs
          pathname={pathname}
          user={user}
          getEntryRouteForRoles={getEntryRouteForRoles}
        />
      </div>

      <div className={cn("flex shrink-0 items-center", NAVBAR_RIGHT_GAP)}>
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
