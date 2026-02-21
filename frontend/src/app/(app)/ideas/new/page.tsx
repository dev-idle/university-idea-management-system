"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIdeasContextQuery, useCreateIdeaMutation } from "@/hooks/use-ideas";
import { SubmitIdeaForm } from "@/components/features/ideas/submit-idea-form";
import { ROUTES } from "@/config/constants";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  ALERT_WARNING_CLASS,
  IDEAS_HUB_SPACING,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function SubmitIdeaPage() {
  const router = useRouter();
  const {
    data: context,
    status: contextStatus,
    error: contextError,
  } = useIdeasContextQuery();
  const createMutation = useCreateIdeaMutation();

  useEffect(() => {
    if (contextStatus === "error") throw contextError;
  }, [contextStatus, contextError]);

  const canSubmit = context?.canSubmit ?? false;

  useEffect(() => {
    if (contextStatus === "success" && !canSubmit) {
      router.replace(ROUTES.IDEAS);
    }
  }, [contextStatus, canSubmit, router]);

  useEffect(() => {
    document.title = "New proposal | Greenwich University";
    return () => {
      document.title = "Greenwich University — Idea Management";
    };
  }, []);

  if (
    contextStatus === "pending" ||
    (contextStatus === "success" && !context)
  ) {
    return (
      <div className={PAGE_WRAPPER_NARROW_CLASS}>
        <LoadingState />
      </div>
    );
  }

  if (contextStatus === "success" && !canSubmit) {
    return (
      <div className={cn("space-y-8", PAGE_WRAPPER_NARROW_CLASS)}>
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is currently closed. Redirecting to Ideas Hub…
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn(IDEAS_HUB_SPACING, PAGE_WRAPPER_NARROW_CLASS)}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className={cn("flex flex-wrap items-center", BREADCRUMB_GHOST_CLASS)}>
          <li>
            <Link
              href={ROUTES.IDEAS}
              className="transition-colors duration-200 hover:text-foreground"
            >
              Ideas Hub
            </Link>
          </li>
          <li className="flex items-center" aria-current="page">
            <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
            New proposal
          </li>
        </ol>
      </nav>
      <h1 className="sr-only">New proposal</h1>
      {context && (
        <SubmitIdeaForm
          context={context}
          onSuccess={() => router.push(ROUTES.IDEAS)}
          onCancel={() => router.push(ROUTES.IDEAS)}
          isPending={createMutation.isPending}
          mutateAsync={createMutation.mutateAsync}
          error={createMutation.error ?? null}
          variant="fullPage"
        />
      )}
    </div>
  );
}
