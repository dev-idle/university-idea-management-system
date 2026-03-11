"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { LoginGate } from "./login-gate";
import { ROUTES } from "@/config/constants";

/** Wraps auth form panel with LoginGate when on login or forgot-password. */
export function AuthFormWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useGate = pathname === ROUTES.LOGIN || pathname === ROUTES.FORGOT_PASSWORD;
  if (useGate) return <LoginGate>{children}</LoginGate>;
  return <>{children}</>;
}
