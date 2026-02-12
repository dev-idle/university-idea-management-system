"use client";

import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/stores/auth.store";
import { getEntryRouteForRoles } from "@/config/constants";
import { BrandLogo } from "./brand-logo";

const UNIVERSITY_NAME = "Greenwich University";
const SYSTEM_NAME = "Internal Idea Collection System";

type SiteBrandingVariant = "sidebar" | "header";

interface SiteBrandingProps {
  variant?: SiteBrandingVariant;
  /** When true, wrap in Link to role entry route. Default true for sidebar. */
  linkToEntry?: boolean;
  /** When true (sidebar only), show only the icon. */
  collapsed?: boolean;
}

export function SiteBranding({ variant = "sidebar", linkToEntry = true, collapsed = false }: SiteBrandingProps) {
  const user = useAuthStore((s) => s.user);
  const entryHref = user?.roles?.length ? getEntryRouteForRoles(user.roles) : ROUTES.LOGIN;

  /* ── Header (navbar): full logo at a compact, readable height ──────────── */
  if (variant === "header") {
    const logo = <BrandLogo className="h-7" />;

    if (linkToEntry) {
      return (
        <Link
          href={entryHref}
          className="flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {logo}
        </Link>
      );
    }
    return logo;
  }

  /* ── Sidebar: collapsed = compact icon, expanded = logo + subtitle ─────── */
  const content = collapsed ? (
    <BrandLogo className="size-9" align="left" />
  ) : (
    <div className="flex flex-col gap-1.5">
      <BrandLogo className="h-9" align="left" />
      <span className="text-[11px] font-normal leading-snug text-muted-foreground">
        {SYSTEM_NAME}
      </span>
    </div>
  );

  const wrapperClassName = collapsed
    ? "flex w-full items-center justify-center"
    : "flex items-center";

  if (linkToEntry) {
    return (
      <Link
        href={entryHref}
        className={`${wrapperClassName} rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring transition-[padding] duration-300 ease-in-out`}
        aria-label={collapsed ? `${UNIVERSITY_NAME} — ${SYSTEM_NAME}. Go to home.` : undefined}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
