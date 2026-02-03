"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/stores/auth.store";
import { getEntryRouteForRoles } from "@/config/constants";

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

  const isCompact = variant === "header" || collapsed;
  const content = (
    <>
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary-foreground/25 transition-[width,height] duration-300 ease-in-out ${isCompact ? "size-8" : "size-10"}`}
        aria-hidden
      >
        <GraduationCap
          className={`transition-[width,height] duration-300 ease-in-out ${isCompact ? "size-5" : "size-6"}`}
          strokeWidth={1.5}
          stroke="currentColor"
          fill="none"
        />
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <span
            className={`font-serif font-semibold tracking-tight text-primary ${variant === "header" ? "text-sm" : "text-lg leading-tight"}`}
          >
            {UNIVERSITY_NAME}
          </span>
          {variant === "sidebar" && (
            <span className="mt-1 block text-xs font-normal leading-snug text-muted-foreground">
              {SYSTEM_NAME}
            </span>
          )}
        </div>
      )}
    </>
  );

  const wrapperClassName = isCompact
    ? "flex items-center justify-center gap-2"
    : "flex items-center gap-3";

  if (linkToEntry) {
    return (
      <Link
        href={entryHref}
        className={`${wrapperClassName} rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring transition-[padding] duration-300 ease-in-out ${collapsed ? "w-full justify-center" : ""}`}
        aria-label={collapsed ? `${UNIVERSITY_NAME} — ${SYSTEM_NAME}. Go to home.` : undefined}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
