import type { Metadata } from "next";
import { IdeasHubContent } from "@/components/features/ideas/ideas-hub-content";
import {
  PAGE_CONTAINER_CLASS,
  IDEAS_HUB_SPACING,
} from "@/config/design";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Browse ideas across the university (read-only).",
};

export default function QaManagerIdeasPage() {
  return (
    <div className={`${IDEAS_HUB_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <IdeasHubContent />
    </div>
  );
}
