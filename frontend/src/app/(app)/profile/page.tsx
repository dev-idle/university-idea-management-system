import type { Metadata } from "next";
import { ProfileContent } from "@/components/features/profile/profile-content";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Account details and security. Access is by invitation only; contact your administrator for provisioning.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
