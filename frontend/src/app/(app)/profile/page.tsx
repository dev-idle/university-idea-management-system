import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileContent } from "@/components/features/profile/profile-content";
import { LoadingState } from "@/components/ui/loading-state";
import { PROFILE_PAGE_CLASS } from "@/components/features/admin/constants";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Account details and security. Access is by invitation only; contact your administrator for provisioning.",
};

export default function ProfilePage() {
  return (
    <div className={`${PROFILE_PAGE_CLASS} ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<LoadingState />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
