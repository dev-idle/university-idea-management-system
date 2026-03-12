"use client";

import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/stores/auth.store";
import { getEntryRouteForRoles } from "@/config/constants";
import { SIDEBAR_COLLAPSED_HIT } from "@/config/design";
import { BrandLogo } from "./brand-logo";
import { BrandIcon } from "./brand-icon";

const UNIVERSITY_NAME = "Greenwich University";

type SiteBrandingVariant = "sidebar" | "header";

interface SiteBrandingProps {
  variant?: SiteBrandingVariant;
  /** When true, wrap in Link to role entry route. Default true for sidebar. */
  linkToEntry?: boolean;
  /** When true (sidebar only), show only the icon. */
  collapsed?: boolean;
  /** When true (header only), show only icon on mobile, full logo from sm+. */
  compactOnMobile?: boolean;
}

export function SiteBranding({ variant = "sidebar", linkToEntry = true, collapsed = false, compactOnMobile = false }: SiteBrandingProps) {
  const user = useAuthStore((s) => s.user);
  const entryHref = user?.roles?.length ? getEntryRouteForRoles(user.roles) : ROUTES.LOGIN;

  /* ── Header (navbar): full logo — matches Sidebar height (h-9) for consistency ─ */
  if (variant === "header") {
    const logo = compactOnMobile ? (
      <>
        <span className="flex sm:hidden" aria-hidden>
          <BrandIcon className="size-8" />
        </span>
        <span className="hidden sm:block">
          <BrandLogo className="h-9" align="left" />
        </span>
      </>
    ) : (
      <BrandLogo className="h-8" align="left" />
    );

    if (linkToEntry) {
      return (
        <Link
          href={entryHref}
          className="flex cursor-pointer items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={compactOnMobile ? `${UNIVERSITY_NAME}. Go to home.` : undefined}
        >
          {logo}
        </Link>
      );
    }
    return logo;
  }

  /* ── Sidebar: collapsed = icon, expanded = logo. Mobile drawer: 30px for consistency ── */
  const content = collapsed ? (
    <span className={`flex ${SIDEBAR_COLLAPSED_HIT} shrink-0 items-center justify-center`}>
      <BrandIcon className="size-full object-contain" />
    </span>
  ) : (
    <BrandLogo className="h-8" align="left" />
  );

  const wrapperClassName = collapsed
    ? "flex shrink-0 items-center justify-center"
    : "flex items-center";

  if (linkToEntry) {
    return (
      <Link
        href={entryHref}
        className={`cursor-pointer ${wrapperClassName} rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring transition-[padding,opacity] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]`}
        aria-label={collapsed ? `${UNIVERSITY_NAME}. Go to home.` : undefined}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
