"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIdeasContextQuery, useCreateIdeaMutation } from "@/hooks/use-ideas";
import { SubmitIdeaForm } from "@/components/features/ideas/submit-idea-form";
import { ROUTES } from "@/config/constants";
import {
  LOADING_WRAPPER_CLASS,
  LOADING_TEXT_CLASS,
  PAGE_WRAPPER_NARROW_CLASS,
  BACK_LINK_CLASS,
  ALERT_WARNING_CLASS,
  PAGE_TITLE_CLASS,
  STAFF_DESCRIPTION_CLASS,
  STAFF_HEADER_ACCENT_CLASS,
} from "@/config/design";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

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

  if (
    contextStatus === "pending" ||
    (contextStatus === "success" && !context)
  ) {
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
      <div className={`space-y-8 ${PAGE_WRAPPER_NARROW_CLASS}`}>
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is currently closed. Redirecting to Ideas Hub…
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <header className="space-y-4">
        <nav aria-label="Breadcrumb">
          <Link
            href={ROUTES.IDEAS}
            className={BACK_LINK_CLASS}
            aria-label="Return to Ideas Hub"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Ideas Hub
          </Link>
        </nav>
        <div>
          <h1 className={PAGE_TITLE_CLASS}>New proposal</h1>
          <p className={STAFF_DESCRIPTION_CLASS}>
            Share your idea with the community. Be clear, constructive, and
            evidence-based.
          </p>
          <div className={`mt-4 ${STAFF_HEADER_ACCENT_CLASS}`} aria-hidden />
        </div>
      </header>

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
