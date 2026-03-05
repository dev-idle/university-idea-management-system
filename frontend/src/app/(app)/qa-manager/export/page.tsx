import type { Metadata } from "next";
import { ExportContent } from "@/components/features/qa-manager/export-content";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Export Data",
  description:
    "Export all system data (CSV) and documents (ZIP) after the final closure date.",
};

export default function QaManagerExportPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <ExportContent />
    </div>
  );
}
