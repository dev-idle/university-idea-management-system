"use client";

import { SiteBranding } from "@/components/layout/site-branding";
import { SIDEBAR_BORDER_INNER } from "@/config/design";

interface SidebarHeaderProps {
  collapsed: boolean;
}

/**
 * Sidebar header containing the logo. h-16, border-b forms horizon with NavbarHeader.
 */
export function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  return (
    <div
      className={`flex h-16 shrink-0 items-center border-b border-r bg-sidebar transition-[width] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${SIDEBAR_BORDER_INNER} ${
        collapsed
          ? "w-16 flex-col items-center justify-center md:w-20"
          : "min-w-[160px] justify-start px-4 md:w-[272px] md:px-5"
      }`}
    >
      <SiteBranding variant="sidebar" linkToEntry collapsed={collapsed} />
    </div>
  );
}
