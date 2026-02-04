"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
import { useCreateIdeaMutation } from "@/hooks/use-ideas";
import { SubmitIdeaForm } from "@/components/features/ideas/submit-idea-form";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/constants";
import {
  LOADING_WRAPPER_CLASS,
  LOADING_TEXT_CLASS,
  PAGE_WRAPPER_NARROW_CLASS,
  STAFF_PAGE_SPACING,
  BACK_LINK_CLASS,
} from "@/config/design";
import { ALERT_WARNING_CLASS } from "@/config/design";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

export default function SubmitIdeaPage() {
  const router = useRouter();
  const { data: context, status: contextStatus, error: contextError } = useIdeasContextQuery();
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

  if (contextStatus === "pending" || (contextStatus === "success" && !context)) {
    return (
      <div className={PAGE_WRAPPER_NARROW_CLASS}>
        <div className={LOADING_WRAPPER_CLASS}>
          <p className={LOADING_TEXT_CLASS} aria-live="polite">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (contextStatus === "success" && !canSubmit) {
    return (
      <div className={`${STAFF_PAGE_SPACING} ${PAGE_WRAPPER_NARROW_CLASS}`}>
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is currently closed. Redirecting to Ideas Hub…
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`${STAFF_PAGE_SPACING} ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <PageHeader
        title="New proposal"
        description="Proposals should be clear, evidence-based, and aligned with institutional priorities. Complete the form below and accept the Terms and Conditions prior to submission."
        backLink={
          <Link
            href={ROUTES.IDEAS}
            className={BACK_LINK_CLASS}
            aria-label="Return to Ideas Hub"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Return to Ideas Hub
          </Link>
        }
      />

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
