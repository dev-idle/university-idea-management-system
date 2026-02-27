import type { Metadata } from "next";
import { IdeasHubContent } from "@/components/features/ideas/ideas-hub-content";
import {
  PAGE_CONTAINER_CLASS,
  IDEAS_HUB_SPACING,
} from "@/config/design";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Formal improvement proposals for the active academic year.",
};

export default function IdeasPage() {
  return (
    <div className={`${IDEAS_HUB_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <IdeasHubContent />
    </div>
  );
}
