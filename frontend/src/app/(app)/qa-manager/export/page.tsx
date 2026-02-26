import type { Metadata } from "next";
import { ExportContent } from "@/components/features/qa-manager/export-content";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Export Data",
  description:
    "Export all system data (CSV) and documents (ZIP) after the final closure date.",
};

export default function QaManagerExportPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <ExportContent />
    </div>
  );
}
