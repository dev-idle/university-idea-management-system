import dynamic from "next/dynamic";
import { LoadingState } from "@/components/ui/loading-state";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

const IdeaDetailContent = dynamic(
  () => import("@/components/features/ideas/idea-detail").then((m) => ({ default: m.IdeaDetailContent })),
  {
    loading: () => (
      <div className={PAGE_CONTAINER_CLASS}>
        <LoadingState compact />
      </div>
    ),
  },
);

export default function IdeaDetailPage() {
  return <IdeaDetailContent />;
}
