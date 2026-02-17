"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Client-only button: prefer parent path (e.g. /admin/academic-years/1 → /admin/academic-years), else history.back() or home. */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const handleBack = () => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    if (segments.length >= 2) {
      const parentPath = "/" + segments.slice(0, -1).join("/");
      router.push(parentPath);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      className={buttonVariants({
        variant: "ghost",
        size: "default",
        className: "gap-2 text-muted-foreground hover:text-foreground",
      })}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      Go back
    </button>
  );
}
