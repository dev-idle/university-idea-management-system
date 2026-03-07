"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { PAGE_CONTAINER_CLASS, IDEAS_HUB_SPACING } from "@/config/design";
import { TR_PAGE_FADE } from "@/config/design";

/** Shown when idea detail returns 404 (deleted or invalid ID). */
export default function IdeaNotFound() {
  return (
    <div className={`${IDEAS_HUB_SPACING} ${PAGE_CONTAINER_CLASS} ${TR_PAGE_FADE}`}>
      <div className="flex min-h-[20rem] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-muted/40">
          <Lightbulb className="size-7 text-muted-foreground/50" strokeWidth={1.25} aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Idea not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground/85">
          This idea does not exist or has been removed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/ideas"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "gap-2",
            })}
          >
            <Lightbulb className="size-4 shrink-0" aria-hidden />
            Browse ideas
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
