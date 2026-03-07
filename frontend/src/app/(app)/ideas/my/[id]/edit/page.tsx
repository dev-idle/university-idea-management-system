"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMyIdeaQuery,
  useUpdateMyIdeaMutation,
  useAddAttachmentMutation,
  useRemoveAttachmentMutation,
  useUploadParamsQuery,
  uploadFileViaBackend,
} from "@/hooks/use-ideas";
import type { UpdateIdeaBody, OwnIdea } from "@/lib/schemas/ideas.schema";
import { updateIdeaBodySchema } from "@/lib/schemas/ideas.schema";
import { ROUTES, buildPageTitle } from "@/config/constants";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { fetchWithAuthResponse } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  FORM_SUBMIT_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  IDEAS_NEW_CARD_CLASS,
  IDEAS_NEW_FORM_PX,
  IDEAS_NEW_FORM_PY,
  IDEAS_NEW_OVERLINE,
  IDEAS_NEW_INPUT,
  IDEAS_NEW_SELECT_TRIGGER,
  IDEAS_NEW_TEXTAREA,
  IDEAS_NEW_ACTIONS,
  IDEAS_HUB_SPACING,
} from "@/config/design";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAGE_CONTAINER_CLASS,
  ALERT_WARNING_CLASS,
  LOADING_SPINNER_CLASS,
} from "@/config/design";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Paperclip,
  X,
  FileText,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_LINK_CLASS,
  BREADCRUMB_CURRENT_CLASS,
  BREADCRUMB_SEP_CLASS,
  FORM_FIELD_ERROR_CLASS,
} from "@/components/features/admin/constants";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES =
  ".pdf,.doc,.docx,.txt,image/jpeg,image/png,image/gif,image/webp";

/* ─── Form values type ────────────────────────────────────────────────────── */

type EditIdeaFormValues = UpdateIdeaBody;

/* ─── AttachmentRow ───────────────────────────────────────────────────────── */

function AttachmentRow({
  att,
  onRemove,
  removing,
  disabled,
}: {
  att: { id: string; fileName: string; secureUrl: string; mimeType?: string | null };
  onRemove: () => void;
  removing: boolean;
  disabled: boolean;
}) {
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  const handleView = async () => {
    setViewError(null);
    setViewLoading(true);
    try {
      const res = await fetchWithAuthResponse(
        `ideas/attachments/${att.id}/view`,
      );
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

  const handleDownload = async () => {
    try {
      const res = await fetchWithAuthResponse(
        `ideas/attachments/${att.id}/download`,
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
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
            aria-label={viewLoading ? "Opening…" : `View ${att.fileName}`}
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
            className="rounded-lg text-muted-foreground hover:bg-muted/[0.06] hover:text-foreground"
            aria-label={`Download ${att.fileName}`}
            onClick={handleDownload}
          >
            <Download className="size-4" aria-hidden />
          </Button>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-muted-foreground hover:bg-destructive/[0.08] hover:text-destructive"
              aria-label={`Remove ${att.fileName}`}
              onClick={onRemove}
              disabled={removing}
            >
              {removing ? (
                <span className={LOADING_SPINNER_CLASS} aria-hidden />
              ) : (
                <X className="size-4" aria-hidden />
              )}
            </Button>
          )}
        </div>
      </div>
      {viewError && (
        <span className={FORM_FIELD_ERROR_CLASS} role="alert">
          {viewError}
        </span>
      )}
    </li>
  );
}

/* ─── Edit form (mounts only when idea is loaded, so defaultValues are correct) ─ */

function EditIdeaForm({
  idea,
  closed,
}: {
  idea: OwnIdea;
  closed: boolean;
}) {
  const router = useRouter();
  const id = idea.id;
  const categories = idea.categories ?? [];
  const resolvedCategoryId =
    idea.categoryId ?? idea.category?.id ?? categories[0]?.id ?? "";

  const { data: uploadParams, status: uploadParamsStatus } =
    useUploadParamsQuery({ enabled: true });
  const updateMutation = useUpdateMyIdeaMutation();
  const addAttachmentMutation = useAddAttachmentMutation();
  const removeAttachmentMutation = useRemoveAttachmentMutation();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasAttachmentChanges, setHasAttachmentChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditIdeaFormValues>({
    resolver: zodResolver(updateIdeaBodySchema) as Resolver<EditIdeaFormValues>,
    defaultValues: {
      title: idea.title,
      description: idea.description ?? "",
      categoryId: resolvedCategoryId,
      isAnonymous: idea.isAnonymous,
    },
  });

  const categoryId = watch("categoryId");
  const isAnonymous = watch("isAnonymous");
  const attachments = idea.attachments ?? [];

  async function onSubmit(data: EditIdeaFormValues) {
    try {
      await updateMutation.mutateAsync({ id, body: data });
      router.push(ROUTES.MY_IDEAS);
    } catch (err) {
      const message = getErrorMessage(err, ERROR_FALLBACK_FORM.updateIdea);
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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setUploadError(`Maximum ${MAX_ATTACHMENTS} files allowed.`);
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setUploadError(
            `"${file.name}" is larger than ${MAX_FILE_SIZE_MB} MB.`,
          );
          continue;
        }
        const ref = await uploadFileViaBackend(file);
        await addAttachmentMutation.mutateAsync({ ideaId: id, body: ref });
        setHasAttachmentChanges(true);
        if (attachments.length + i + 1 >= MAX_ATTACHMENTS) break;
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : ERROR_FALLBACK_FORM.upload;
      setUploadError(
        msg === "Failed to fetch"
          ? "Could not reach the server."
          : getErrorMessage(err, ERROR_FALLBACK_FORM.upload),
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveAttachment(attachmentId: string) {
    try {
      await removeAttachmentMutation.mutateAsync({
        ideaId: id,
        attachmentId,
      });
      setHasAttachmentChanges(true);
    } catch {
      // error shown inline
    }
  }

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
      {/* Core fields */}
      <div className="space-y-6">
        {/* Category */}
        <div className="group space-y-2 min-w-0">
          <Label
            htmlFor="edit-category"
            className="cursor-pointer text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-primary"
          >
            Category
          </Label>
          <Select
            value={categoryId}
            onValueChange={(v) =>
              setValue("categoryId", v, { shouldValidate: true, shouldDirty: true })
            }
            disabled={closed}
          >
            <SelectTrigger
              id="edit-category"
              className={IDEAS_NEW_SELECT_TRIGGER}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
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

        {/* Title */}
        <div className="group space-y-2 min-w-0">
          <Label
            htmlFor="edit-title"
            className="cursor-pointer text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-primary"
          >
            Title
          </Label>
          <Input
            id="edit-title"
            type="text"
            placeholder="A clear, descriptive title"
            maxLength={500}
            disabled={closed}
            className={IDEAS_NEW_INPUT}
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <p className="text-xs leading-relaxed text-muted-foreground/80">
            Titles must be unique within the proposal cycle.
          </p>
          {errors.title && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="group space-y-2 min-w-0">
          <Label
            htmlFor="edit-content"
            className="cursor-pointer text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-primary"
          >
            Content
          </Label>
          <Textarea
            id="edit-content"
            placeholder="Context, recommendation, and expected benefits."
            maxLength={10000}
            rows={8}
            disabled={closed}
            className={IDEAS_NEW_TEXTAREA}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Optional: Anonymous + Attachments */}
      <section className="space-y-6" aria-labelledby="edit-optional-heading">
        <p id="edit-optional-heading" className={IDEAS_NEW_OVERLINE}>
          Optional
        </p>
        <div className="space-y-6">
          <div className="group flex items-start gap-3">
            <Checkbox
              id="edit-anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) =>
                setValue("isAnonymous", !!checked, { shouldDirty: true })
              }
              disabled={closed}
              className="mt-0.5"
            />
            <div className="grid gap-0.5">
              <Label
                htmlFor="edit-anonymous"
                className="cursor-pointer text-[13px] font-medium text-foreground/92"
              >
                Submit anonymously
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground/80">
                Withheld from publication, retained for governance and compliance.
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-attachments-trigger"
              className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-foreground/92"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground/65" aria-hidden />
              Supporting documents
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground/80">
              PDF, Word, images. Max {MAX_ATTACHMENTS} files, {MAX_FILE_SIZE_MB} MB each.
            </p>
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
                  disabled={
                    uploading || attachments.length >= MAX_ATTACHMENTS || closed
                  }
                />
                {!closed && (
                  <Button
                    id="edit-attachments-trigger"
                    type="button"
                    variant="outline"
                    size="default"
                    className="h-10 gap-2 rounded-xl border border-border/80 font-medium transition-colors duration-200 hover:border-primary/30 hover:bg-muted/[0.04] focus-visible:outline-none focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      uploading || attachments.length >= MAX_ATTACHMENTS
                    }
                  >
                    {uploading ? (
                      <span className={LOADING_SPINNER_CLASS} aria-hidden />
                    ) : (
                      <Paperclip className="size-4" aria-hidden />
                    )}
                    {uploading ? "Uploading…" : "Add document"}
                  </Button>
                )}
                {uploadError && (
                  <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                    {uploadError}
                  </p>
                )}
              </>
            )}
            {attachments.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {attachments.map((att) => (
                  <AttachmentRow
                    key={att.id}
                    att={att}
                    onRemove={() => handleRemoveAttachment(att.id)}
                    removing={
                      removeAttachmentMutation.isPending &&
                      removeAttachmentMutation.variables?.attachmentId === att.id
                    }
                    disabled={closed}
                  />
                ))}
              </ul>
            )}
            {removeAttachmentMutation.error && (
              <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                {getErrorMessage(
                  removeAttachmentMutation.error,
                  "Could not remove the document.",
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className={cn(IDEAS_NEW_ACTIONS, "flex-wrap justify-between")}>
        <div className="flex flex-wrap items-center gap-3">
          {!closed && (
            <Button
              type="submit"
              disabled={updateMutation.isPending || (!isDirty && !hasAttachmentChanges)}
              className={FORM_SUBMIT_BUTTON_CLASS}
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.MY_IDEAS)}
            disabled={updateMutation.isPending}
            className={FORM_OUTLINE_BUTTON_CLASS}
          >
            {closed ? "Back" : "Cancel"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function EditIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;

  const { data: idea, status, error } = useMyIdeaQuery(id);
  useEffect(() => {
    if (!id) router.replace(ROUTES.MY_IDEAS);
  }, [id, router]);

  useEffect(() => {
    if (idea?.title) {
      document.title = buildPageTitle("Edit Proposal");
      // No cleanup: next page sets its own title
    }
  }, [idea?.title]);

  if (!id) return null;
  if (status === "error") throw error;
  if (status === "pending" || !idea) {
    return (
      <div className={PAGE_CONTAINER_CLASS}>
        <LoadingState compact />
      </div>
    );
  }

  const categories = idea.categories ?? [];
  const resolvedCategoryId =
    idea.categoryId ?? idea.category?.id ?? categories[0]?.id ?? "";

  const cycleActive = idea.cycleStatus === "ACTIVE";
  const submissionClosed = idea.submissionClosesAt
    ? new Date() >= new Date(idea.submissionClosesAt)
    : true;
  const closed = !cycleActive || submissionClosed;

  return (
    <div className={cn(IDEAS_HUB_SPACING, PAGE_CONTAINER_CLASS)}>
      {/* Breadcrumb — aligned with /ideas/new */}
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
          <li className="flex items-center">
            <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
            <Link
              href={ROUTES.MY_IDEAS}
              className={BREADCRUMB_LINK_CLASS}
            >
              My Ideas
            </Link>
          </li>
          <li className="flex items-center" aria-current="page">
            <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
            <span className={BREADCRUMB_CURRENT_CLASS}>Edit proposal</span>
          </li>
        </ol>
      </nav>

      <h1 className="sr-only">Edit proposal</h1>

      {/* Closed alert */}
      {closed && (
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            {!cycleActive
              ? "The proposal cycle has closed. This proposal is now read-only."
              : "The submission period has closed. This proposal is now read-only."}
          </AlertDescription>
        </Alert>
      )}

      {/* Form — mounts only when idea is loaded; no category = show error */}
      {!resolvedCategoryId ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              This proposal has no category assigned. Please contact support if you need to edit it.
            </AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.MY_IDEAS)}
            className={FORM_OUTLINE_BUTTON_CLASS}
          >
            Back
          </Button>
        </div>
      ) : (
        <EditIdeaForm idea={idea} closed={closed} key={idea.id} />
      )}
    </div>
  );
}
