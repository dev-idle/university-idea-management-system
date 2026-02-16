"use client";

import { useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateIdeaBody, IdeasContext } from "@/lib/schemas/ideas.schema";
import { createIdeaBodySchema } from "@/lib/schemas/ideas.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { useUploadParamsQuery, uploadFileViaBackend, type IdeaAttachmentRef } from "@/hooks/use-ideas";
import { fetchWithAuthResponse } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SECTION_LABEL_CLASS, SECTION_CARD_TITLE_CLASS, SECTION_CARD_DESCRIPTION_CLASS, CARD_CLASS, FORM_SUBMIT_BUTTON_CLASS, FORM_OUTLINE_BUTTON_CLASS } from "@/config/design";
import { Paperclip, X, Loader2, FileText, PenLine, Sparkles, FileCheck } from "lucide-react";

/** Form values: attachments required (array), termsAccepted boolean for initial false. */
type SubmitIdeaFormValues = Omit<CreateIdeaBody, "attachments" | "termsAccepted"> & {
  attachments: IdeaAttachmentRef[];
  termsAccepted: boolean;
};

/** Single attachment row: view (same as idea detail) and remove. */
function AttachmentRow({
  att,
  onRemove,
}: {
  att: IdeaAttachmentRef;
  onRemove: () => void;
}) {
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  const handleView = async () => {
    setViewError(null);
    setViewLoading(true);
    try {
      const res = await fetchWithAuthResponse("ideas/attachments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secureUrl: att.secureUrl,
          fileName: att.fileName,
          mimeType: att.mimeType ?? undefined,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setViewError(e instanceof Error ? e.message : ERROR_FALLBACK_FORM.openFile);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <li className="flex flex-col gap-1 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-muted-foreground" title={att.fileName}>
          {att.fileName}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`View ${att.fileName}`}
            onClick={handleView}
            disabled={viewLoading}
          >
            {viewLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <FileText className="size-4" aria-hidden />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${att.fileName}`}
            onClick={onRemove}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      {viewError ? (
        <span className="text-xs leading-relaxed text-destructive/90" role="alert">
          {viewError}
        </span>
      ) : null}
    </li>
  );
}

const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.txt,image/jpeg,image/png,image/gif,image/webp";

const TERMS_INTRO =
  "By submitting an idea through this system, you acknowledge and agree to the following:";

const TERMS_CLAUSES = [
  {
    title: "Originality and rights",
    body: "You warrant that you have the right to submit this idea and that it is your original work, or that you have obtained all necessary permissions and hold appropriate rights for its submission. You accept responsibility for the accuracy and legality of the content submitted.",
  },
  {
    title: "Institutional use and evaluation",
    body: "The University may use, review, evaluate, and process your submission in accordance with its institutional policies, academic integrity guidelines, and the rules governing the current proposal cycle. Submission does not create any contractual or proprietary obligation on the part of the University beyond those set out in applicable policies.",
  },
  {
    title: "Identity and anonymity",
    body: "Your identity will be recorded and retained for audit, governance, and accountability purposes. Where you have elected to submit anonymously, your identity will not be displayed to other users but will remain stored for authorised administrative and compliance purposes.",
  },
  {
    title: "Proposal cycle",
    body: "Submissions are governed by the current proposal cycle, including its opening and closure dates. Late or out-of-cycle submissions are not accepted. The University reserves the right to amend cycle rules in accordance with institutional requirements.",
  },
] as const;

interface SubmitIdeaFormProps {
  context: IdeasContext;
  onSuccess: () => void;
  onCancel?: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateIdeaBody) => Promise<unknown>;
  error: Error | null;
  variant?: "default" | "card" | "fullPage";
}

export function SubmitIdeaForm({
  context,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: SubmitIdeaFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<SubmitIdeaFormValues>({
    resolver: zodResolver(createIdeaBodySchema) as Resolver<SubmitIdeaFormValues>,
    defaultValues: {
      title: "",
      description: "",
      categoryId: context.categories[0]?.id ?? "",
      cycleId: context.activeCycleId ?? "",
      isAnonymous: false,
      termsAccepted: false,
      attachments: [],
    },
  });

  const categoryId = watch("categoryId");
  const termsAccepted = watch("termsAccepted");
  const isAnonymous = watch("isAnonymous");
  const attachments = watch("attachments") ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { data: uploadParams, status: uploadParamsStatus } = useUploadParamsQuery({
    enabled: true,
  });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !uploadParams) return;
    setUploadError(null);
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setUploadError(`Maximum ${MAX_ATTACHMENTS} files allowed.`);
      e.target.value = "";
      return;
    }
    setUploading(true);
    const next: IdeaAttachmentRef[] = [...attachments];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setUploadError(`"${file.name}" is larger than ${MAX_FILE_SIZE_MB} MB.`);
          continue;
        }
        const ref = await uploadFileViaBackend(file);
        next.push(ref);
        if (next.length >= MAX_ATTACHMENTS) break;
      }
      setValue("attachments", next, { shouldValidate: true });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : ERROR_FALLBACK_FORM.upload;
      setUploadError(
        msg === "Failed to fetch"
          ? "Could not reach the server. Check that the backend is running and NEXT_PUBLIC_API_BASE is correct."
          : msg,
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeAttachment(index: number) {
    const next = attachments.filter((_, i) => i !== index);
    setValue("attachments", next, { shouldValidate: true });
  }

  async function onSubmit(data: SubmitIdeaFormValues) {
    if (!context.activeCycleId) return;
    try {
      const body: CreateIdeaBody = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cycleId: context.activeCycleId,
        isAnonymous: data.isAnonymous,
        termsAccepted: true,
        attachments: data.attachments,
      };
      await mutateAsync(body);
      onSuccess();
    } catch (err) {
      const message = getErrorMessage(err, ERROR_FALLBACK_FORM.submitIdea);
      const isDuplicateTitle =
        message.toLowerCase().includes("already exists") &&
        message.toLowerCase().includes("title");
      if (isDuplicateTitle) {
        setError("title", { type: "server", message });
      } else {
        setError("root", { type: "server", message });
      }
    }
  }

  const isFullPage = variant === "fullPage";
  const fieldSpacing = isFullPage ? "space-y-4" : "space-y-2";
  const blockPadding = isFullPage ? "p-5 sm:p-6" : "";
  const blockStyle = isFullPage
    ? "rounded-xl border border-border bg-muted/5"
    : "";
  const sectionSpacing = isFullPage ? "space-y-8" : "space-y-6";

  const formContent = (
    <>
      {/* Section 1: Category first, then title & content */}
      <section className={sectionSpacing} aria-labelledby="section-proposal-heading">
        {isFullPage && (
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary/90">
              <PenLine className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="section-proposal-heading" className={SECTION_CARD_TITLE_CLASS}>
                Proposal details
              </h2>
              <p className={`mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`}>
                Select a category, then provide a clear title and full description of your proposal.
              </p>
            </div>
          </div>
        )}

        {/* Category — listed first */}
        <div className={cn(fieldSpacing, blockStyle, blockPadding)}>
          <Label htmlFor="idea-category" className="text-sm font-medium text-foreground">
            Category
          </Label>
          <Select
            value={categoryId}
            onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
          >
            <SelectTrigger id="idea-category" className="h-11 rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20" aria-required>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {context.categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="rounded-md">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Select the category that best describes your proposal.
          </p>
          {errors.categoryId && (
            <p className="text-xs leading-relaxed text-destructive/90" role="alert">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className={cn(fieldSpacing, blockStyle, blockPadding)}>
          <Label htmlFor="idea-title" className="text-sm font-medium text-foreground">
            Title
          </Label>
          <Input
            id="idea-title"
            type="text"
            placeholder="A clear, descriptive title for your proposal"
            maxLength={500}
            className="h-11 rounded-lg border-border bg-background text-base placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-invalid={!!errors.title}
            aria-required
            {...register("title")}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Provide a clear, concise title that summarises the proposal. Titles must be unique within this proposal cycle.
          </p>
          {errors.title && (
            <p className="text-xs leading-relaxed text-destructive/90" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className={cn(fieldSpacing, blockStyle, blockPadding)}>
          <Label htmlFor="idea-content" className="text-sm font-medium text-foreground">
            Content
          </Label>
          <Textarea
            id="idea-content"
            placeholder="Describe the proposal: the context or problem, your recommendation, and expected benefits or outcomes."
            maxLength={10000}
            rows={isFullPage ? 8 : 6}
            className={cn(
              "min-h-[8rem] resize-y rounded-lg border-border bg-background py-3 text-base leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20",
              isFullPage && "min-h-[12rem]",
            )}
            aria-invalid={!!errors.description}
            aria-required
            {...register("description")}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Include context, recommendation, and expected benefits in a clear, constructive manner.
          </p>
          {errors.description && (
            <p className="text-xs leading-relaxed text-destructive/90" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>
      </section>

      <input type="hidden" {...register("cycleId")} value={context.activeCycleId ?? ""} />
      <input type="hidden" {...register("termsAccepted")} value="true" />

      {isFullPage && <Separator className="bg-border/80" />}

      {/* Section 2: Optional */}
      <section className={sectionSpacing} aria-labelledby="section-optional-heading">
        {isFullPage && (
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-muted/30 text-muted-foreground">
              <Sparkles className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="section-optional-heading" className={SECTION_CARD_TITLE_CLASS}>
                Optional
              </h2>
              <p className={`mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`}>
                Anonymous submission and supporting documents.
              </p>
            </div>
          </div>
        )}
        {!isFullPage && (
          <p className={SECTION_LABEL_CLASS}>
            Optional
          </p>
        )}

        <div className="flex items-start gap-3">
          <Checkbox
            id="idea-anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setValue("isAnonymous", !!checked)}
            aria-describedby="idea-anonymous-desc"
            className="mt-0.5"
          />
          <div className="grid gap-0.5">
            <Label
              id="idea-anonymous-desc"
              htmlFor="idea-anonymous"
              className="cursor-pointer text-sm font-medium text-foreground"
            >
              Submit anonymously
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your proposal will be displayed without your identity; your identity is retained for audit purposes.
            </p>
          </div>
        </div>

        <div className={fieldSpacing}>
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Supporting documents
          </Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            PDF, Word, or images. Maximum {MAX_ATTACHMENTS} files, {MAX_FILE_SIZE_MB} MB per file.
          </p>
          {uploadParamsStatus === "error" && (
            <p className="text-sm text-warning" role="alert">
              Document upload is currently unavailable. Please contact support if you need to attach files.
            </p>
          )}
          {uploadParamsStatus === "success" && uploadParams && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple
                className="hidden"
                aria-label="Choose files to upload"
                onChange={handleFileSelect}
                disabled={uploading || attachments.length >= MAX_ATTACHMENTS}
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                className="h-9 gap-2 rounded-lg border border-border font-medium transition-colors hover:bg-muted/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || attachments.length >= MAX_ATTACHMENTS}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Paperclip className="size-4" aria-hidden />
                )}
                {uploading ? "Uploading…" : "Add Document"}
              </Button>
              {uploadError && (
                <p className="text-xs leading-relaxed text-destructive/90" role="alert">
                  {uploadError}
                </p>
              )}
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-1.5 rounded-xl border border-border bg-muted/5 px-5 py-3">
                  {attachments.map((att, index) => (
                    <AttachmentRow
                      key={`${att.cloudinaryPublicId}-${index}`}
                      att={att}
                      onRemove={() => removeAttachment(index)}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

      {isFullPage && <Separator className="bg-border/80" />}

      {/* Terms: single checkbox + popup to view full text */}
      <section className={sectionSpacing} aria-labelledby="section-terms-heading">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary/90">
            <FileCheck className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="section-terms-heading" className={SECTION_CARD_TITLE_CLASS}>
              Terms and declaration
            </h2>
            <p className={`mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`}>
              You must read and accept the Terms and Conditions prior to submission.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="idea-terms"
              checked={termsAccepted === true}
              onCheckedChange={(checked) =>
                setValue("termsAccepted", checked === true, { shouldValidate: true })
              }
              aria-describedby="idea-terms-desc"
              className="mt-0 size-4 rounded border-border"
            />
            <Label
              id="idea-terms-desc"
              htmlFor="idea-terms"
              className="cursor-pointer text-sm font-medium leading-snug text-foreground"
            >
              I have read and accept the Terms and Conditions
            </Label>
          </div>
          <span className="hidden text-border sm:inline" aria-hidden>
            ·
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="link"
                className="h-auto gap-1.5 p-0 text-xs font-normal text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:ring-0 focus-visible:underline"
              >
                <FileText className="size-3.5 shrink-0 opacity-80" aria-hidden />
                View terms and conditions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-lg flex flex-col gap-0 p-0 overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm">
              <DialogHeader className="shrink-0 border-b border-border/40 bg-muted/30 px-5 py-3.5 pr-10">
                <DialogTitle className="font-sans text-base font-semibold tracking-tight text-foreground">
                  Terms and Conditions
                </DialogTitle>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-[13px] leading-relaxed text-muted-foreground">
                <p className="font-sans text-base font-medium text-foreground">
                  Idea Submission — Terms and Conditions
                </p>
                <p className="mt-2">{TERMS_INTRO}</p>
                <ol className="mt-4 list-none space-y-0">
                  {TERMS_CLAUSES.map((clause, index) => (
                    <li key={index} className="mb-4 last:mb-0">
                      <p className="font-medium text-foreground text-[13px]">
                        {index + 1}. {clause.title}
                      </p>
                      <p className="mt-1">{clause.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {errors.termsAccepted && (
          <p className="text-xs leading-relaxed text-destructive/90" role="alert">
            {errors.termsAccepted.message}
          </p>
        )}
      </section>

      {(error || errors.root) && (
        <div
          className="rounded-lg border border-destructive/15 bg-destructive/[0.03] px-3 py-2 text-xs leading-relaxed text-destructive/90"
          role="alert"
        >
          {getErrorMessage(error ?? errors.root?.message, ERROR_FALLBACK_FORM.submitIdea)}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border/80 pt-8">
        <Button
          type="submit"
          disabled={isPending || !termsAccepted}
          className={FORM_SUBMIT_BUTTON_CLASS}
        >
          {isPending ? "Submitting…" : "Submit proposal"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className={FORM_OUTLINE_BUTTON_CLASS}
          >
            Cancel
          </Button>
        )}
      </div>
    </>
  );

  if (isFullPage) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="overflow-hidden rounded-2xl border border-border/30 bg-card space-y-12 px-6 py-10 sm:px-8"
      >
        {formContent}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex flex-col",
        variant === "card" && CARD_CLASS + " p-6",
        "gap-6",
      )}
    >
      {formContent}
    </form>
  );
}
