import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileContent } from "@/components/features/profile/profile-content";
import { LoadingState } from "@/components/ui/loading-state";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Account details and security. Access is by invitation only; contact your administrator for provisioning.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProfileContent />
    </Suspense>
  );
}
