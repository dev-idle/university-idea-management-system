import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { IdeasHubRedirect } from "@/components/features/ideas/ideas-hub-redirect";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_CONTAINER_CLASS,
  IDEAS_HUB_SPACING,
} from "@/config/design";

const IdeasHubContent = dynamic(
  () => import("@/components/features/ideas/ideas-hub-content").then((m) => ({ default: m.IdeasHubContent })),
  {
    loading: () => (
      <div className={PAGE_CONTAINER_CLASS}>
        <LoadingState compact />
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Ideas",
  description: "Formal improvement proposals for the active academic year.",
};

export default function IdeasPage() {
  return (
    <IdeasHubRedirect>
      <div className={`${IDEAS_HUB_SPACING} ${PAGE_CONTAINER_CLASS}`}>
        <IdeasHubContent />
      </div>
    </IdeasHubRedirect>
  );
}
