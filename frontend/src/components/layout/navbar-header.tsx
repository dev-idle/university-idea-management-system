"use client";

import { usePathname } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { getEntryRouteForRoles, ROUTES } from "@/config/constants";
import { hasRole } from "@/lib/rbac";
import { LAYOUT_BORDER_MAIN, LAYOUT_DIVIDER_LINE } from "@/config/design";
import {
  HeaderBreadcrumbs,
  HeaderIconButton,
  UserMenu,
} from "@/components/layout/header-parts";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

/** Top app bar height — aligns with SidebarHeader. */
const TOP_BAR_HEIGHT = "h-16";

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

  return (
    <header
      className={`sticky top-0 z-10 flex ${TOP_BAR_HEIGHT} min-w-0 shrink-0 items-center gap-4 border-b bg-background/98 px-5 backdrop-blur-md md:px-6 ${LAYOUT_BORDER_MAIN}`}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <HeaderBreadcrumbs
          pathname={pathname}
          user={user}
          getEntryRouteForRoles={getEntryRouteForRoles}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {hasRole(user.roles, "STAFF") && (
          <HeaderIconButton
            icon={Lightbulb}
            label="Ideas Hub"
            href={ROUTES.IDEAS}
            isActive={pathname === ROUTES.IDEAS}
          />
        )}
        <NotificationDropdown variant="standalone" />

        <div className={`mx-2 hidden h-5 w-px md:block ${LAYOUT_DIVIDER_LINE}`} aria-hidden />

        <UserMenu
          user={user}
          displayName={displayName}
          avatarInitial={avatarInitial}
          onLogout={onLogout}
          variant="minimal"
        />
      </div>
    </header>
  );
}
