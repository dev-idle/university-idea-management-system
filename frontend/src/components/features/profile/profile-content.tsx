"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, UserCircle } from "lucide-react";
import { useProfileQuery } from "@/hooks/use-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import {
  profileSchema,
  updateProfileFormSchema,
  type Profile,
  type UpdateProfileBody,
  type UpdateProfileFormValues,
} from "@/lib/schemas/profile.schema";
import { ROLE_LABELS } from "@/lib/rbac";
import { ChangePasswordForm } from "./change-password-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CARD_CLASS,
  SECTION_LABEL_CLASS,
  SECTION_CARD_HEADER_CLASS,
  SECTION_CARD_TITLE_CLASS,
  SECTION_CARD_DESCRIPTION_CLASS,
} from "@/config/design";
import { getAvatarInitial } from "@/lib/utils";

const GENDER_NONE = "__none__";
const GENDER_OPTIONS = [
  { value: GENDER_NONE, label: "Not specified" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
] as const;


/** Profile loading skeleton: uses muted background per design system. */
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <section className={`${CARD_CLASS} px-6 py-7`} aria-hidden>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Skeleton className="size-24 shrink-0 rounded-full bg-muted/80" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-7 w-48 bg-muted/80" />
            <Skeleton className="h-4 w-36 bg-muted/60" />
            <Skeleton className="h-4 w-56 bg-muted/60" />
          </div>
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Card className={`overflow-hidden ${CARD_CLASS}`}>
          <CardHeader className={SECTION_CARD_HEADER_CLASS}>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-center">
              <Skeleton className="size-9 shrink-0 rounded-lg bg-muted/60" />
              <Skeleton className="h-4 w-44 bg-muted/60" />
              <Skeleton className="col-start-1 col-span-2 row-start-2 h-4 w-72 bg-muted/50" />
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={i === 2 ? "sm:col-span-2" : ""}>
                  <Skeleton className="mb-2 h-3.5 w-24 bg-muted/50" />
                  <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-10 w-28 rounded-md bg-muted/50" />
          </CardContent>
        </Card>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

interface EditableDisplayNameProps {
  displayName: string;
  onSave: (value: string) => Promise<void>;
  isSaving: boolean;
}

function EditableDisplayName({
  displayName,
  onSave,
  isSaving,
}: EditableDisplayNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(displayName);
  }, [displayName]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function handleSave() {
    const trimmed = value.trim();
    await onSave(trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setValue(displayName);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          placeholder="Full name"
          className="h-10 rounded-lg text-foreground"
          maxLength={255}
          disabled={isSaving}
          aria-label="Full name"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-10 rounded-lg"
          >
            <X className="size-4 shrink-0" aria-hidden />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSave()}
            disabled={isSaving || value.trim() === displayName}
            className="h-10 rounded-lg"
          >
            {isSaving ? (
              <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" aria-hidden />
            ) : (
              <Check className="size-4 shrink-0" aria-hidden />
            )}
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h2 className="truncate font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {displayName}
      </h2>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 rounded-lg px-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
        onClick={() => setEditing(true)}
        aria-label="Edit full name"
      >
        <Pencil className="size-3.5" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider">
          Edit
        </span>
      </Button>
    </div>
  );
}

export function ProfileContent() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error } = useProfileQuery();

  const updateProfileMutation = useMutation({
    mutationFn: async (body: Partial<UpdateProfileBody>) => {
      const data = await fetchWithAuth<unknown>("me", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return profileSchema.parse(data) as Profile;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.profile.me(), updated);
    },
  });

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      gender: "",
      dateOfBirth: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        gender: profile.gender?.trim() ? profile.gender : GENDER_NONE,
        dateOfBirth: profile.dateOfBirth ?? "",
      });
    }
  }, [profile, form]);

  async function handleSaveFullName(value: string) {
    const trimmed = value.trim();
    await updateProfileMutation.mutateAsync({
      fullName: trimmed,
    });
  }

  async function onSubmitEditProfile(data: UpdateProfileFormValues) {
    const body: Partial<UpdateProfileBody> = {
      ...(data.fullName !== undefined && { fullName: data.fullName.trim() || undefined }),
      ...(data.phone !== undefined && { phone: data.phone.trim() || undefined }),
      ...(data.address !== undefined && { address: data.address.trim() || undefined }),
      ...(data.gender !== undefined &&
        data.gender !== GENDER_NONE && { gender: data.gender }),
      ...(data.dateOfBirth !== undefined &&
        data.dateOfBirth.trim() !== "" && { dateOfBirth: data.dateOfBirth.trim() }),
    };
    await updateProfileMutation.mutateAsync(body);
  }

  if (isLoading) return <ProfileSkeleton />;
  if (error || !profile) {
    return (
      <div
        className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5"
        role="alert"
      >
        <p className="text-destructive text-sm font-medium leading-relaxed">
          Unable to load profile. Please try again.
        </p>
      </div>
    );
  }

  const roleLabel =
    ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role;
  const displayName = profile.fullName?.trim() || profile.email;
  const initials = getAvatarInitial(profile.fullName, profile.email);
  const apiError = updateProfileMutation.error as Error | undefined;

  return (
    <div className="space-y-8">
      <section
        className={`${CARD_CLASS} px-6 py-7`}
        aria-label="Profile identity"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Avatar className="size-24 shrink-0 rounded-full border-2 border-border/80 bg-muted/40 ring-2 ring-background">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2.5">
            <EditableDisplayName
              displayName={displayName}
              onSave={handleSaveFullName}
              isSaving={updateProfileMutation.isPending}
            />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {profile.email}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {roleLabel}
              {profile.department?.name ? (
                <>
                  <span className="mx-2 text-border" aria-hidden>·</span>
                  {profile.department.name}
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Card className={`overflow-hidden ${CARD_CLASS}`}>
          <CardHeader className={SECTION_CARD_HEADER_CLASS}>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-center">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground [&>svg]:shrink-0">
                <UserCircle className="size-4" strokeWidth={1.25} aria-hidden />
              </div>
              <CardTitle className={SECTION_CARD_TITLE_CLASS}>
                Personal information
              </CardTitle>
              <p className={`col-start-1 col-span-2 row-start-2 ${SECTION_CARD_DESCRIPTION_CLASS}`}>
                Update your name, contact details, and other information.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitEditProfile)}
                className="space-y-6"
                noValidate
                aria-label="Edit profile"
              >
                {apiError && (
                  <p
                    className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-destructive text-sm leading-relaxed"
                    role="alert"
                    aria-live="polite"
                  >
                    {apiError.message}
                  </p>
                )}
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SECTION_LABEL_CLASS}>
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full name"
                            className="h-10 rounded-lg"
                            maxLength={255}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SECTION_LABEL_CLASS}>
                          Phone
                          <span className="ml-1 font-normal normal-case text-muted-foreground/80">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Phone number"
                            className="h-10 rounded-lg"
                            maxLength={30}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className={SECTION_LABEL_CLASS}>
                          Address
                          <span className="ml-1 font-normal normal-case text-muted-foreground/80">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Address"
                            className="h-10 rounded-lg"
                            maxLength={1000}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SECTION_LABEL_CLASS}>
                          Gender
                          <span className="ml-1 font-normal normal-case text-muted-foreground/80">(optional)</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || GENDER_NONE}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SECTION_LABEL_CLASS}>
                          Date of birth
                          <span className="ml-1 font-normal normal-case text-muted-foreground/80">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-10 rounded-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="border-t border-border pt-6">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="h-10 rounded-lg px-5 text-sm font-medium"
                  >
                    {updateProfileMutation.isPending ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
                          aria-hidden
                        />
                        Saving…
                      </span>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
