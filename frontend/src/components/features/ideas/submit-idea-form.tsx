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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  CARD_CLASS,
  FORM_SUBMIT_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  LOADING_SPINNER_CLASS,
  IDEAS_NEW_CARD_CLASS,
  IDEAS_NEW_FORM_PX,
  IDEAS_NEW_FORM_PY,
  IDEAS_NEW_OVERLINE,
  IDEAS_NEW_ACTIONS,
  IDEAS_NEW_INPUT,
  IDEAS_NEW_SELECT_TRIGGER,
  IDEAS_NEW_TEXTAREA,
} from "@/config/design";
import { FORM_FIELD_ERROR_CLASS } from "@/components/features/admin/constants";
import { Paperclip, X, FileText } from "lucide-react";

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
    <li className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/[0.05] px-4 py-2.5 transition-colors duration-150 hover:bg-muted/[0.08]">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <FileText
            className="size-4 shrink-0 text-muted-foreground/65"
            aria-hidden
          />
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="min-w-0 truncate cursor-default text-[13px] text-foreground/80">
                {att.fileName}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{att.fileName}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground hover:bg-muted/[0.06] hover:text-foreground"
            aria-label={`View ${att.fileName}`}
            onClick={handleView}
            disabled={viewLoading}
          >
            {viewLoading ? (
              <span className={LOADING_SPINNER_CLASS} aria-hidden />
            ) : (
              <FileText className="size-4" aria-hidden />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground hover:bg-destructive/[0.08] hover:text-destructive"
            aria-label={`Remove ${att.fileName}`}
            onClick={onRemove}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      {viewError ? (
        <span className={FORM_FIELD_ERROR_CLASS} role="alert">
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
  error?: Error | null;
  variant?: "default" | "card" | "fullPage";
}

export function SubmitIdeaForm({
  context,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
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
      categoryId: "",
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
  const fieldGap = isFullPage ? "space-y-6" : "space-y-4";
  const sectionGap = isFullPage ? "space-y-8" : "space-y-6";
  const labelClass = isFullPage
    ? "cursor-pointer text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-primary"
    : "text-sm font-medium cursor-pointer";
  const hintClass = isFullPage
    ? "text-xs leading-relaxed text-muted-foreground/80"
    : "text-xs text-muted-foreground";

  const formContent = (
    <>
      {/* Core fields: Category, Title, Content */}
      <div className={fieldGap}>
        <div className={cn("space-y-2", isFullPage && "group min-w-0")}>
          <Label htmlFor="idea-category" className={labelClass}>
            Category
          </Label>
          <Select
            value={categoryId}
            onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
          >
            <SelectTrigger
              id="idea-category"
              className={isFullPage ? IDEAS_NEW_SELECT_TRIGGER : "h-10 rounded-lg border-border"}
              aria-required
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {context.categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="rounded-md">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className={cn("space-y-2", isFullPage && "group min-w-0")}>
          <Label htmlFor="idea-title" className={labelClass}>
            Title
          </Label>
          <Input
            id="idea-title"
            type="text"
            placeholder="A clear, descriptive title"
            maxLength={500}
            className={isFullPage ? IDEAS_NEW_INPUT : "h-10 rounded-lg border-border"}
            aria-invalid={!!errors.title}
            aria-required
            {...register("title")}
          />
          {errors.title && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className={cn("space-y-2", isFullPage && "group min-w-0")}>
          <Label htmlFor="idea-content" className={labelClass}>
            Content
          </Label>
          <Textarea
            id="idea-content"
            placeholder="Context, recommendation, and expected benefits."
            maxLength={10000}
            rows={isFullPage ? 8 : 6}
            className={isFullPage ? IDEAS_NEW_TEXTAREA : "min-h-[6rem] resize-y rounded-lg border-border py-3"}
            aria-invalid={!!errors.description}
            aria-required
            {...register("description")}
          />
          {errors.description && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <input type="hidden" {...register("cycleId")} value={context.activeCycleId ?? ""} />

      {/* Optional */}
      <section className={sectionGap} aria-labelledby="section-optional-heading">
        <p id="section-optional-heading" className={isFullPage ? IDEAS_NEW_OVERLINE : "text-xs font-medium uppercase tracking-wider text-muted-foreground"}>
          Optional
        </p>
        <div className={fieldGap}>
          <div className={cn("flex items-start gap-3", isFullPage && "group")}>
            <Checkbox
              id="idea-anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setValue("isAnonymous", !!checked)}
              aria-describedby="idea-anonymous-desc"
              className="mt-0.5"
            />
            <div className="grid gap-0.5">
              <Label id="idea-anonymous-desc" htmlFor="idea-anonymous" className={labelClass}>
                Submit anonymously
              </Label>
              <p className={hintClass}>
                Withheld from publication, retained for governance and compliance.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <FileText className="size-4 shrink-0 mt-0.5 text-muted-foreground/65" aria-hidden />
              <div className="min-w-0 flex-1 space-y-1">
                <Label
                  htmlFor="idea-attachments-trigger"
                  className="cursor-pointer text-[13px] font-medium text-foreground/92"
                >
                  Supporting documents
                </Label>
                <p className="text-xs leading-relaxed text-muted-foreground/80">
                  PDF, Word, images. Max {MAX_ATTACHMENTS} files, {MAX_FILE_SIZE_MB} MB each.
                </p>
              </div>
            </div>
            {uploadParamsStatus === "error" && (
              <p className="text-[11px] text-warning/90" role="alert">
                Upload currently unavailable.
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
                  aria-label="Choose files"
                  onChange={handleFileSelect}
                  disabled={uploading || attachments.length >= MAX_ATTACHMENTS}
                />
                <Button
                  id="idea-attachments-trigger"
                  type="button"
                  variant="outline"
                  size="default"
                  className="h-10 gap-2 rounded-xl border border-border/80 font-medium transition-colors duration-200 hover:border-primary/30 hover:bg-muted/[0.04] focus-visible:outline-none focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || attachments.length >= MAX_ATTACHMENTS}
                >
                  {uploading ? (
                    <span className={LOADING_SPINNER_CLASS} aria-hidden />
                  ) : (
                    <Paperclip className="size-4" aria-hidden />
                  )}
                  {uploading ? "Uploading…" : "Add document"}
                </Button>
                {uploadError && (
                  <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                    {uploadError}
                  </p>
                )}
              </>
            )}
            {attachments.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {attachments.map((att, index) => (
                  <AttachmentRow
                    key={`${att.cloudinaryPublicId}-${index}`}
                    att={att}
                    onRemove={() => removeAttachment(index)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Terms + Actions */}
      <section className={sectionGap} aria-labelledby="section-terms-heading">
        <p id="section-terms-heading" className={isFullPage ? IDEAS_NEW_OVERLINE : "text-xs font-medium uppercase tracking-wider text-muted-foreground"}>
          Terms and Conditions
        </p>
        <div className="space-y-4">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="idea-terms"
                checked={termsAccepted === true}
                onCheckedChange={(checked) =>
                  setValue("termsAccepted", checked === true, { shouldValidate: true })
                }
                aria-describedby="idea-terms-desc"
                className="mt-0.5 size-4 shrink-0 rounded border-border"
              />
              <Label id="idea-terms-desc" htmlFor="idea-terms" className="cursor-pointer text-sm font-medium leading-snug text-foreground/92">
                I accept the Terms and Conditions
              </Label>
            </div>
            <div className="flex w-full items-start gap-3 sm:w-auto">
              <div className="w-[15px] shrink-0 sm:hidden" aria-hidden />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="h-auto !min-h-0 w-fit gap-1.5 self-start !p-0 !px-0 text-xs font-normal text-muted-foreground/80 underline-offset-2 hover:text-foreground/90 hover:underline focus-visible:ring-0"
                  >
                    <FileText className="size-3.5 shrink-0 opacity-70" aria-hidden />
                    View terms
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="shrink-0 border-b border-border/40 px-5 py-3.5 pr-10">
                  <DialogTitle className="text-base font-semibold">
                    Terms and Conditions
                  </DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-[13px] leading-relaxed text-muted-foreground">
                  <p className="font-medium text-foreground">{TERMS_INTRO}</p>
                  <ol className="mt-4 space-y-3">
                    {TERMS_CLAUSES.map((clause, i) => (
                      <li key={i}>
                        <p className="font-medium text-foreground text-[13px]">{i + 1}. {clause.title}</p>
                        <p className="mt-1">{clause.body}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
          {errors.termsAccepted && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.termsAccepted.message}
            </p>
          )}

          <div className={cn(isFullPage ? IDEAS_NEW_ACTIONS : "flex flex-wrap items-center gap-3 border-t border-border/40 pt-6")}>
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
        </div>
      </section>
    </>
  );

  if (isFullPage) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          IDEAS_NEW_CARD_CLASS,
          "overflow-hidden space-y-8",
          IDEAS_NEW_FORM_PX,
          IDEAS_NEW_FORM_PY,
        )}
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
