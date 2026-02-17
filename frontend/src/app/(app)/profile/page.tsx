import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileContent } from "@/components/features/profile/profile-content";
import { PAGE_CONTAINER_CLASS } from "@/config/design";
import {
  PROFILE_PAGE_CLASS,
  PROFILE_IDENTITY_CARD_CLASS,
  PROFILE_SECTION_CARD_CLASS,
  PROFILE_SECTION_HEADER_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
  PROFILE_FORM_FIELD_GAP,
  PROFILE_FORM_FIELD_STACK,
} from "@/components/features/admin/constants";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_BG_SUBTLE, SKELETON_BG_MEDIUM, SKELETON_BG_STRONG } from "@/config/design";
import { User, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Account details and security. Access is by invitation only; contact your administrator for provisioning.",
};

/** Profile loading skeleton — matches ProfileContent structure. */
function ProfilePageSkeleton() {
  return (
    <div className={PROFILE_PAGE_CLASS}>
      <section className={PROFILE_IDENTITY_CARD_CLASS} aria-hidden>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Skeleton className={`size-20 sm:size-24 shrink-0 rounded-full ${SKELETON_BG_STRONG}`} />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className={`h-8 w-48 ${SKELETON_BG_STRONG}`} />
            <Skeleton className={`h-4 w-64 ${SKELETON_BG_MEDIUM}`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_480px]">
        <Card className={PROFILE_SECTION_CARD_CLASS}>
          <CardHeader className={PROFILE_SECTION_HEADER_CLASS}>
            <CardTitle className={PROFILE_SECTION_TITLE_CLASS}>
              <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              Personal information
            </CardTitle>
            <CardAction>
              <Skeleton className={`h-9 w-24 rounded-lg ${SKELETON_BG_MEDIUM}`} />
            </CardAction>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <div className={`grid ${PROFILE_FORM_FIELD_GAP} sm:grid-cols-2`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={i === 2 ? "sm:col-span-2" : ""}>
                  <Skeleton className={`mb-2 h-4 w-24 ${SKELETON_BG_MEDIUM}`} />
                  <Skeleton className={`h-11 w-full rounded-lg ${SKELETON_BG_SUBTLE}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className={PROFILE_SECTION_CARD_CLASS}>
          <CardHeader className={PROFILE_SECTION_HEADER_CLASS}>
            <CardTitle className={PROFILE_SECTION_TITLE_CLASS}>
              <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              Change password
            </CardTitle>
            <CardAction>
              <Skeleton className={`h-9 w-28 rounded-lg ${SKELETON_BG_MEDIUM}`} />
            </CardAction>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <div className={PROFILE_FORM_FIELD_STACK}>
              <Skeleton className={`h-11 w-full rounded-lg ${SKELETON_BG_SUBTLE}`} />
              <Skeleton className={`h-11 w-full rounded-lg ${SKELETON_BG_SUBTLE}`} />
              <Skeleton className={`h-11 w-full rounded-lg ${SKELETON_BG_SUBTLE}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className={`${PROFILE_PAGE_CLASS} ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
