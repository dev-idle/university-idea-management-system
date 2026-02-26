"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Pencil, Check, X, User } from "lucide-react";
import { useProfileQuery } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
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
import { ROLE_LABELS, isStaffOnly } from "@/lib/rbac";
import { ChangePasswordForm } from "./change-password-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PROFILE_PAGE_CLASS,
  PROFILE_IDENTITY_CARD_CLASS,
  PROFILE_DISPLAY_NAME_CLASS,
  PROFILE_METADATA_CLASS,
  PROFILE_SECTION_CARD_CLASS,
  PROFILE_SECTION_HEADER_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
  PROFILE_LABEL_CLASS,
  PROFILE_INPUT_CLASS,
  DATE_PICKER_INPUT_CLASS,
  PROFILE_OPTIONAL_CLASS,
  PROFILE_HEADER_BUTTON_CLASS,
  PROFILE_AVATAR_CLASS,
  PROFILE_AVATAR_FALLBACK_CLASS,
  PROFILE_FORM_FIELD_GAP,
  PROFILE_FORM_ITEM_CLASS,
  PROFILE_SELECT_TRIGGER_CLASS,
  PROFILE_ERROR_CLASS,
  FORM_ERROR_BLOCK_CLASS,
  PROFILE_SM_OUTLINE_CLASS,
  PROFILE_SM_PRIMARY_CLASS,
  PROFILE_EDIT_BUTTON_CLASS,
  PROFILE_STAFF_PAGE_CLASS,
  PROFILE_STAFF_IDENTITY_CARD_CLASS,
  PROFILE_STAFF_SECTION_CARD_CLASS,
  PROFILE_STAFF_SM_OUTLINE_CLASS,
  PROFILE_STAFF_SM_PRIMARY_CLASS,
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import {
  LOADING_SPINNER_ON_PRIMARY_CLASS,
  LOADING_SPINNER_ON_PRIMARY_SM_CLASS,
  IDEAS_HUB_SPACING,
  PAGE_WRAPPER_NARROW_CLASS,
  PAGE_CONTAINER_CLASS,
} from "@/config/design";
import { ROUTES } from "@/config/constants";
import { getAvatarInitial, cn } from "@/lib/utils";

const GENDER_NONE = "__none__";
const GENDER_OPTIONS = [
  { value: GENDER_NONE, label: "Not specified" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
] as const;


interface EditableDisplayNameProps {
  displayName: string;
  onSave: (value: string) => Promise<void>;
  isSaving: boolean;
  outlineClass?: string;
  primaryClass?: string;
}

function EditableDisplayName({
  displayName,
  onSave,
  isSaving,
  outlineClass = PROFILE_SM_OUTLINE_CLASS,
  primaryClass = PROFILE_SM_PRIMARY_CLASS,
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
          className={PROFILE_INPUT_CLASS}
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
            className={outlineClass}
          >
            <X className="size-4 shrink-0" aria-hidden />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSave()}
            disabled={isSaving || value.trim() === displayName}
            className={primaryClass}
          >
            {isSaving ? (
              <span className={LOADING_SPINNER_ON_PRIMARY_CLASS} aria-hidden />
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
      <h2 className={`truncate ${PROFILE_DISPLAY_NAME_CLASS}`}>
        {displayName}
      </h2>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={PROFILE_EDIT_BUTTON_CLASS}
        onClick={() => setEditing(true)}
        aria-label="Edit full name"
      >
        <Pencil className="size-3.5" aria-hidden />
        Edit
      </Button>
    </div>
  );
}

export function ProfileContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
    const body: Partial<UpdateProfileBody> = {};
    // Send empty string for cleared fields so backend can set null (undefined would omit the field)
    if (data.fullName !== undefined) body.fullName = data.fullName?.trim() ?? "";
    if (data.phone !== undefined) body.phone = data.phone?.trim() ?? "";
    if (data.address !== undefined) body.address = data.address?.trim() ?? "";
    if (data.gender !== undefined)
      body.gender = data.gender === GENDER_NONE ? "" : data.gender;
    if (data.dateOfBirth !== undefined)
      body.dateOfBirth = data.dateOfBirth?.trim() ?? "";
    await updateProfileMutation.mutateAsync(body);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center py-20">
        <LoadingState compact />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className={`${PROFILE_ERROR_CLASS} px-6 py-5`} role="alert">
        <p className="text-sm leading-relaxed text-destructive">
          Unable to load profile.
        </p>
      </div>
    );
  }

  const staffLayout = isStaffOnly(user?.roles);

  const roleLabel =
    ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role;
  const displayName = profile.fullName?.trim() || profile.email;
  const initials = getAvatarInitial(profile.fullName, profile.email);
  const apiError = updateProfileMutation.error as Error | undefined;

  const identityCardClass = staffLayout ? PROFILE_STAFF_IDENTITY_CARD_CLASS : PROFILE_IDENTITY_CARD_CLASS;
  const sectionCardClass = staffLayout ? PROFILE_STAFF_SECTION_CARD_CLASS : PROFILE_SECTION_CARD_CLASS;
  const pageWrapperClass = staffLayout
    ? `${IDEAS_HUB_SPACING} ${PAGE_WRAPPER_NARROW_CLASS}`
    : `${PROFILE_PAGE_CLASS} ${PAGE_CONTAINER_CLASS}`;

  return (
    <div className={pageWrapperClass}>
      {staffLayout && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className={`flex flex-wrap items-center ${BREADCRUMB_GHOST_CLASS}`}>
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
              Profile
            </li>
          </ol>
        </nav>
      )}
      <h1 className="sr-only">Profile</h1>
      <section
        className={identityCardClass}
        aria-label="Profile identity"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Avatar className={`${PROFILE_AVATAR_CLASS} shrink-0`}>
            <AvatarFallback className={PROFILE_AVATAR_FALLBACK_CLASS}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <EditableDisplayName
              displayName={displayName}
              onSave={handleSaveFullName}
              isSaving={updateProfileMutation.isPending}
              outlineClass={staffLayout ? PROFILE_STAFF_SM_OUTLINE_CLASS : undefined}
              primaryClass={staffLayout ? PROFILE_STAFF_SM_PRIMARY_CLASS : undefined}
            />
            <p className={PROFILE_METADATA_CLASS}>{profile.email}</p>
            <p className={PROFILE_METADATA_CLASS}>
              {roleLabel}
              {profile.department?.name && (
                <>
                  <span className="mx-1.5 text-muted-foreground/80" aria-hidden>|</span>
                  {profile.department.name}
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <div className={cn("grid gap-6", staffLayout ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-[1fr_440px]")}>
        <Card className={sectionCardClass}>
          <CardHeader className={PROFILE_SECTION_HEADER_CLASS}>
            <CardTitle className={PROFILE_SECTION_TITLE_CLASS}>
              <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              Personal information
            </CardTitle>
            <CardAction>
              <Button
                form="edit-profile-form"
                type="submit"
                disabled={updateProfileMutation.isPending}
                aria-busy={updateProfileMutation.isPending}
                className={PROFILE_HEADER_BUTTON_CLASS}
              >
                {updateProfileMutation.isPending ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={LOADING_SPINNER_ON_PRIMARY_SM_CLASS}
                      aria-hidden
                    />
                    Saving…
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <Form {...form}>
              <form
                id="edit-profile-form"
                onSubmit={form.handleSubmit(onSubmitEditProfile)}
                className="space-y-6"
                noValidate
                aria-label="Edit profile"
              >
                {apiError && (
                  <p
                    className={FORM_ERROR_BLOCK_CLASS}
                    role="alert"
                    aria-live="polite"
                  >
                    {apiError.message}
                  </p>
                )}
                <div className={`grid ${PROFILE_FORM_FIELD_GAP} sm:grid-cols-2`}>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                        <FormLabel className={PROFILE_LABEL_CLASS}>
                          Full name
                          <span className={PROFILE_OPTIONAL_CLASS}>(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full name"
                            className={PROFILE_INPUT_CLASS}
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
                      <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                        <FormLabel className={PROFILE_LABEL_CLASS}>
                          Phone
                          <span className={PROFILE_OPTIONAL_CLASS}>(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Phone number"
                            className={PROFILE_INPUT_CLASS}
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
                      <FormItem className={`${PROFILE_FORM_ITEM_CLASS} sm:col-span-2`}>
                        <FormLabel className={PROFILE_LABEL_CLASS}>
                          Address
                          <span className={PROFILE_OPTIONAL_CLASS}>(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Address"
                            className={PROFILE_INPUT_CLASS}
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
                      <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                        <FormLabel className={PROFILE_LABEL_CLASS}>
                          Gender
                          <span className={PROFILE_OPTIONAL_CLASS}>(optional)</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || GENDER_NONE}
                        >
                          <FormControl>
                            <SelectTrigger className={PROFILE_SELECT_TRIGGER_CLASS}>
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
                      <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                        <FormLabel className={PROFILE_LABEL_CLASS}>
                          Date of birth
                          <span className={PROFILE_OPTIONAL_CLASS}>(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            id="dateOfBirth"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Select date of birth"
                            aria-invalid={!!form.formState.errors.dateOfBirth}
                            aria-describedby={form.formState.errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                            className={DATE_PICKER_INPUT_CLASS}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <ChangePasswordForm staffLayout={staffLayout} />
      </div>
    </div>
  );
}
