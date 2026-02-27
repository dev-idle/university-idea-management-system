"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIdeasContextQuery, useCreateIdeaMutation } from "@/hooks/use-ideas";
import { useAuth } from "@/hooks/use-auth";
import { hasRole } from "@/lib/rbac";
import { SubmitIdeaForm } from "@/components/features/ideas/submit-idea-form";
import { ROUTES, buildPageTitle } from "@/config/constants";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_CONTAINER_CLASS,
  ALERT_WARNING_CLASS,
  IDEAS_HUB_SPACING,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_LINK_CLASS,
  BREADCRUMB_CURRENT_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function SubmitIdeaPage() {
  const router = useRouter();
  const { user } = useAuth();
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
  const isQaCoordinator = hasRole(user?.roles, "QA_COORDINATOR");

  useEffect(() => {
    if (isQaCoordinator) {
      router.replace(ROUTES.IDEAS);
      return;
    }
    if (contextStatus === "success" && !canSubmit) {
      router.replace(ROUTES.IDEAS);
    }
  }, [contextStatus, canSubmit, isQaCoordinator, router]);

  useEffect(() => {
    document.title = buildPageTitle("New Proposal");
    // No cleanup: next page sets its own title via metadata or useEffect
  }, []);

  if (
    contextStatus === "pending" ||
    (contextStatus === "success" && !context)
  ) {
    return (
      <div className={PAGE_CONTAINER_CLASS}>
        <LoadingState compact />
      </div>
    );
  }

  if (contextStatus === "success" && !canSubmit) {
    return (
      <div className={cn("space-y-8", PAGE_CONTAINER_CLASS)}>
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is currently closed. Redirecting to Ideas Hub…
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn(IDEAS_HUB_SPACING, PAGE_CONTAINER_CLASS)}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className={cn("flex flex-wrap items-center", BREADCRUMB_GHOST_CLASS)}>
          <li>
            <Link
              href={ROUTES.IDEAS}
              className={BREADCRUMB_LINK_CLASS}
            >
              Ideas Hub
            </Link>
          </li>
          <li className="flex items-center" aria-current="page">
            <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
            <span className={BREADCRUMB_CURRENT_CLASS}>New proposal</span>
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
