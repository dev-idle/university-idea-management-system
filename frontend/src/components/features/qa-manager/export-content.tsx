"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SECTION_LABEL_CLASS,
  FOCUS_RING_CLASS,
} from "@/config/design";
import {
  useExportableCyclesQuery,
  useExportTriggerMutation,
  useExportStatusQuery,
  downloadExport,
  type ExportableCycle,
  type ExportType,
} from "@/hooks/use-export";
import { Download, Loader2, FileSpreadsheet, FileArchive, AlertCircle } from "lucide-react";

function formatCycleLabel(c: ExportableCycle): string {
  const name = c.name || "Unnamed";
  const closed = new Date(c.interactionClosesAt).toLocaleDateString();
  return `${name} (${c.academicYearName}) — closed ${closed} · ${c.ideaCount} ideas`;
}

function ExportAction({
  type,
  label,
  description,
  icon: Icon,
  selectedCycleId,
  cycles,
  cyclesLoading,
  onTrigger,
  onDownload,
  isTriggerPending,
  jobId,
  statusQuery,
}: {
  type: ExportType;
  label: string;
  description: string;
  icon: React.ElementType;
  selectedCycleId: string | null;
  cycles: ExportableCycle[];
  cyclesLoading: boolean;
  onTrigger: () => void;
  onDownload: () => void;
  isTriggerPending: boolean;
  jobId: string | null;
  statusQuery: ReturnType<typeof useExportStatusQuery>;
}) {
  const status = statusQuery.data?.status;
  const isProcessing =
    status === "processing" || status === "active" || status === "waiting" || isTriggerPending;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="size-4 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {status === "completed" ? (
          <Button
            onClick={onDownload}
            size="sm"
            className="gap-1.5"
            aria-label={`Download ${label}`}
          >
            <Download className="size-4" aria-hidden />
            Download
          </Button>
        ) : (
          <Button
            onClick={onTrigger}
            disabled={isProcessing || !selectedCycleId || cycles.length === 0 || cyclesLoading}
            size="sm"
            className="gap-1.5"
            aria-label={label}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {status === "processing" || status === "active" ? "Preparing…" : "Starting…"}
              </>
            ) : (
              <>
                <Download className="size-4" aria-hidden />
                Generate
              </>
            )}
          </Button>
        )}
        {statusQuery.data?.progress != null &&
          status !== "completed" &&
          status !== "failed" && (
            <span className="text-xs text-muted-foreground">
              {Math.round(statusQuery.data.progress ?? 0)}%
            </span>
          )}
      </div>
    </div>
  );
}

export function ExportContent() {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [jobIdCsv, setJobIdCsv] = useState<string | null>(null);
  const [jobIdDocuments, setJobIdDocuments] = useState<string | null>(null);

  const cyclesQuery = useExportableCyclesQuery();
  const triggerMutation = useExportTriggerMutation();
  const statusCsv = useExportStatusQuery(jobIdCsv, { enabled: !!jobIdCsv });
  const statusDocuments = useExportStatusQuery(jobIdDocuments, { enabled: !!jobIdDocuments });

  const cycles = cyclesQuery.data ?? [];
  const error = triggerMutation.error?.message ?? statusCsv.data?.error ?? statusDocuments.data?.error;
  const [pendingType, setPendingType] = useState<ExportType | null>(null);

  const handleTrigger = (type: ExportType) => {
    if (!selectedCycleId) return;
    triggerMutation.reset();
    if (type === "csv") setJobIdCsv(null);
    else setJobIdDocuments(null);
    setPendingType(type);
    triggerMutation.mutate(
      { cycleId: selectedCycleId, type },
      {
        onSuccess: (data) => {
          if (type === "csv") setJobIdCsv(data.jobId);
          else setJobIdDocuments(data.jobId);
        },
        onSettled: () => setPendingType(null),
      }
    );
  };

  const handleDownload = async (jobId: string | null) => {
    if (!jobId) return;
    try {
      await downloadExport(jobId);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="export-heading">
        <h2 id="export-heading" className={SECTION_LABEL_CLASS}>
          Export by proposal cycle
        </h2>
        <Card className={`mt-3 ${FOCUS_RING_CLASS}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export data and documents</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Select a closed proposal cycle. Download data (CSV) and documents (ZIP) separately.
              Available only after the final comment closure date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Proposal cycle</label>
              <Select
                value={selectedCycleId ?? ""}
                onValueChange={(v) => setSelectedCycleId(v || null)}
                disabled={cyclesQuery.isLoading}
              >
                <SelectTrigger
                  aria-label="Select proposal cycle to export"
                  className="max-w-md"
                >
                  <SelectValue
                    placeholder={
                      cycles.length === 0
                        ? "No exportable cycles"
                        : "Choose a cycle…"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {formatCycleLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cycles.length === 0 && !cyclesQuery.isLoading && (
                <p className="text-xs text-muted-foreground">
                  No closed cycles. Export is allowed after the final comment closure date.
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <ExportAction
                type="csv"
                label="Download data (CSV)"
                description="Ideas, comments, votes, users, and related data in CSV files."
                icon={FileSpreadsheet}
                selectedCycleId={selectedCycleId}
                cycles={cycles}
                cyclesLoading={cyclesQuery.isLoading}
                onTrigger={() => handleTrigger("csv")}
                onDownload={() => handleDownload(jobIdCsv)}
                isTriggerPending={pendingType === "csv"}
                jobId={jobIdCsv}
                statusQuery={statusCsv}
              />
              <ExportAction
                type="documents"
                label="Download documents (ZIP)"
                description="All uploaded supporting documents for ideas in this cycle."
                icon={FileArchive}
                selectedCycleId={selectedCycleId}
                cycles={cycles}
                cyclesLoading={cyclesQuery.isLoading}
                onTrigger={() => handleTrigger("documents")}
                onDownload={() => handleDownload(jobIdDocuments)}
                isTriggerPending={pendingType === "documents"}
                jobId={jobIdDocuments}
                statusQuery={statusDocuments}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
