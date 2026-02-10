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
  useDeleteMyIdeaMutation,
  useAddAttachmentMutation,
  useRemoveAttachmentMutation,
  useUploadParamsQuery,
  uploadFileViaBackend,
} from "@/hooks/use-ideas";
import type { UpdateIdeaBody } from "@/lib/schemas/ideas.schema";
import { updateIdeaBodySchema } from "@/lib/schemas/ideas.schema";
import { ROUTES } from "@/config/constants";
import { getErrorMessage } from "@/lib/errors";
import { fetchWithAuthResponse } from "@/lib/api/client";
import { cn } from "@/lib/utils";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  BACK_LINK_CLASS,
  ALERT_WARNING_CLASS,
  LOADING_WRAPPER_CLASS,
  LOADING_TEXT_CLASS,
} from "@/config/design";
import {
  ArrowLeft,
  Paperclip,
  X,
  Loader2,
  FileText,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";

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
      setViewError(e instanceof Error ? e.message : "Failed to open file.");
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
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/25 bg-muted/10 px-4 py-2.5 transition-colors hover:bg-muted/20">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <FileText
            className="size-4 shrink-0 text-muted-foreground/40"
            aria-hidden
          />
          <span
            className="min-w-0 truncate text-[13px] text-foreground/80"
            title={att.fileName}
          >
            {att.fileName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] text-muted-foreground/50 hover:text-foreground/70"
            onClick={handleView}
            disabled={viewLoading}
          >
            {viewLoading ? "Opening…" : "Open"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] text-muted-foreground/50 hover:text-foreground/70"
            onClick={handleDownload}
          >
            <Download className="size-3.5 shrink-0" aria-hidden />
            Save
          </Button>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${att.fileName}`}
              onClick={onRemove}
              disabled={removing}
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <X className="size-3.5" aria-hidden />
              )}
            </Button>
          )}
        </div>
      </div>
      {viewError && (
        <span className="px-1 text-[11px] text-destructive" role="alert">
          {viewError}
        </span>
      )}
    </li>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function EditIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;

  const { data: idea, status, error } = useMyIdeaQuery(id);
  const { data: uploadParams, status: uploadParamsStatus } =
    useUploadParamsQuery({ enabled: true });
  const updateMutation = useUpdateMyIdeaMutation();
  const deleteMutation = useDeleteMyIdeaMutation();
  const addAttachmentMutation = useAddAttachmentMutation();
  const removeAttachmentMutation = useRemoveAttachmentMutation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditIdeaFormValues>({
    resolver: zodResolver(updateIdeaBodySchema) as Resolver<EditIdeaFormValues>,
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      isAnonymous: false,
    },
  });

  const categoryId = watch("categoryId");
  const isAnonymous = watch("isAnonymous");

  // Populate form only on initial load (not when idea updates due to attachment changes)
  const [formInitialized, setFormInitialized] = useState(false);
  useEffect(() => {
    if (idea && !formInitialized) {
      reset({
        title: idea.title,
        description: idea.description ?? "",
        categoryId: idea.categoryId ?? "",
        isAnonymous: idea.isAnonymous,
      });
      setFormInitialized(true);
    }
  }, [idea, formInitialized, reset]);

  useEffect(() => {
    if (!id) router.replace(ROUTES.MY_IDEAS);
  }, [id, router]);

  if (!id) return null;
  if (status === "error") throw error;
  if (status === "pending" || !idea) {
    return (
      <div className={PAGE_WRAPPER_NARROW_CLASS}>
        <div className={LOADING_WRAPPER_CLASS}>
          <p className={LOADING_TEXT_CLASS} aria-live="polite">
            Loading proposal…
          </p>
        </div>
      </div>
    );
  }

  const closed = idea.submissionClosesAt
    ? new Date() >= new Date(idea.submissionClosesAt)
    : true;
  const categories = idea.categories ?? [];
  const attachments = idea.attachments ?? [];

  async function onSubmit(data: EditIdeaFormValues) {
    try {
      await updateMutation.mutateAsync({ id: id!, body: data });
      router.push(ROUTES.MY_IDEAS);
    } catch (err) {
      const message = getErrorMessage(err, "Update could not be completed.");
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
        await addAttachmentMutation.mutateAsync({ ideaId: id!, body: ref });
        if (attachments.length + i + 1 >= MAX_ATTACHMENTS) break;
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Upload failed.";
      setUploadError(
        msg === "Failed to fetch"
          ? "Could not reach the server."
          : getErrorMessage(err, "Upload failed."),
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveAttachment(attachmentId: string) {
    try {
      await removeAttachmentMutation.mutateAsync({
        ideaId: id!,
        attachmentId,
      });
    } catch {
      // error shown inline
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id!);
      setShowDeleteDialog(false);
      router.push(ROUTES.MY_IDEAS);
    } catch {
      // error shown in dialog
    }
  }

  return (
    <div className={`space-y-10 ${PAGE_WRAPPER_NARROW_CLASS}`}>
      {/* Back */}
      <nav aria-label="Breadcrumb">
        <Link
          href={ROUTES.MY_IDEAS}
          className={BACK_LINK_CLASS}
          aria-label="Return to My Ideas"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          My Ideas
        </Link>
      </nav>

      {/* Header */}
      <header>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Edit Proposal
        </h1>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground/70">
          Update your idea details and manage supporting documents.
        </p>
        <div
          className="mt-4 h-px w-10 bg-gradient-to-r from-primary/80 to-transparent"
          aria-hidden
        />
      </header>

      {/* Closed alert */}
      {closed && (
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            The submission period has closed. You can no longer edit this
            proposal or manage its documents, but you may still delete it.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="overflow-hidden rounded-2xl border border-border/30 bg-card"
      >
        <div className="space-y-8 px-6 py-8 sm:px-8 sm:py-10">
          {/* Category */}
          <div className="space-y-3">
            <Label
              htmlFor="edit-category"
              className="text-sm font-medium text-foreground"
            >
              Category
            </Label>
            <Select
              value={categoryId}
              onValueChange={(v) =>
                setValue("categoryId", v, { shouldValidate: true })
              }
              disabled={closed}
            >
              <SelectTrigger
                id="edit-category"
                className="h-11 rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20"
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="rounded-md">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive" role="alert">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-3">
            <Label
              htmlFor="edit-title"
              className="text-sm font-medium text-foreground"
            >
              Title
            </Label>
            <Input
              id="edit-title"
              type="text"
              placeholder="A clear, descriptive title"
              maxLength={500}
              disabled={closed}
              className="h-11 rounded-lg border-border bg-background text-base placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Titles must be unique within the submission cycle.
            </p>
            {errors.title && (
              <p className="text-sm text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Label
              htmlFor="edit-content"
              className="text-sm font-medium text-foreground"
            >
              Content
            </Label>
            <Textarea
              id="edit-content"
              placeholder="Describe the proposal…"
              maxLength={10000}
              rows={8}
              disabled={closed}
              className="min-h-[12rem] resize-y rounded-lg border-border bg-background py-3 text-base leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Anonymous */}
          <div className="flex items-start gap-3">
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
                className="cursor-pointer text-sm font-medium text-foreground"
              >
                Submit anonymously
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your identity will be hidden from other users.
              </p>
            </div>
          </div>
        </div>

        {/* Attachments section */}
        <div className="border-t border-border/15 px-6 py-8 sm:px-8">
          <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Supporting documents
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            PDF, Word, or images. Maximum {MAX_ATTACHMENTS} files,{" "}
            {MAX_FILE_SIZE_MB} MB per file.
          </p>

          {attachments.length > 0 && (
            <ul className="mt-4 space-y-1.5">
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

          {!closed && (
            <div className="mt-4">
              {uploadParamsStatus === "error" && (
                <p
                  className="text-sm text-amber-600 dark:text-amber-400"
                  role="alert"
                >
                  Document upload is currently unavailable.
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
                    disabled={
                      uploading || attachments.length >= MAX_ATTACHMENTS
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="h-10 gap-2 rounded-lg border-border font-medium"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      uploading || attachments.length >= MAX_ATTACHMENTS
                    }
                  >
                    {uploading ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <Paperclip className="size-4" aria-hidden />
                    )}
                    {uploading ? "Uploading…" : "Add document"}
                  </Button>
                </>
              )}
              {uploadError && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {uploadError}
                </p>
              )}
            </div>
          )}

          {removeAttachmentMutation.error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {getErrorMessage(
                removeAttachmentMutation.error,
                "Could not remove the document.",
              )}
            </p>
          )}
        </div>

        {/* Root error */}
        {(updateMutation.error || errors.root) && (
          <div className="mx-6 mb-6 sm:mx-8">
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-3.5 text-sm text-destructive"
              role="alert"
            >
              {getErrorMessage(
                updateMutation.error ?? errors.root?.message,
                "Update could not be completed.",
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/15 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {!closed && (
              <Button
                type="submit"
                disabled={updateMutation.isPending || !isDirty}
                className="h-10 rounded-lg px-6 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
              >
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.MY_IDEAS)}
              disabled={updateMutation.isPending}
              className="h-10 rounded-lg border-border px-6 font-medium"
            >
              {closed ? "Back" : "Cancel"}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-2 rounded-lg px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        </div>
      </form>

      {/* Delete confirmation */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-semibold tracking-tight">
              Delete proposal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{idea.title}&rdquo;
              </span>{" "}
              along with all its comments, votes, and attachments. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.error && (
            <p className="text-[13px] text-destructive" role="alert">
              {getErrorMessage(
                deleteMutation.error,
                "Could not delete the proposal.",
              )}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-lg"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
