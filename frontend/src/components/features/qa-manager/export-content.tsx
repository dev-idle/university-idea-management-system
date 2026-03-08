"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_SEARCH_WIDTH,
  SHOWING_RANGE_BADGE_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_ACTIONS_MIN_W_2,
  TABLE_ACTIONS_WRAPPER_CLASS,
  ACTION_BUTTON_EDIT_CLASS,
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
} from "@/components/features/admin/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useExportableCyclesQuery,
  useExportTriggerMutation,
  useExportStatusQuery,
  downloadExport,
} from "@/hooks/use-export";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Download, Loader2, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 350;

function formatClosedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ExportContent() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(
    searchInput,
    SEARCH_DEBOUNCE_MS,
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [exportingCycleId, setExportingCycleId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true });
  }, []);

  const cyclesQuery = useExportableCyclesQuery();
  const triggerMutation = useExportTriggerMutation();
  const statusQuery = useExportStatusQuery(jobId, { enabled: !!jobId });

  const filtered = useMemo(() => {
    const cycles = cyclesQuery.data ?? [];
    const withIdeas = cycles.filter((c) => (c.ideaCount ?? 0) > 0);
    const q = debouncedSearch.trim();
    if (!q) return withIdeas;
    const lower = q.toLowerCase();
    return withIdeas.filter(
      (c) =>
        (c.name?.toLowerCase().includes(lower) ?? false) ||
        c.academicYearName.toLowerCase().includes(lower),
    );
  }, [cyclesQuery.data, debouncedSearch]);
  const status = statusQuery.data?.status;
  const isProcessing =
    status === "processing" ||
    status === "active" ||
    status === "waiting" ||
    status === "pending" ||
    triggerMutation.isPending;

  const error =
    downloadError ??
    triggerMutation.error?.message ??
    statusQuery.data?.error;

  const handleTrigger = (cycleId: string) => {
    setDownloadError(null);
    setJobId(null);
    setExportingCycleId(cycleId);
    triggerMutation.mutate(
      { cycleId, type: "full" },
      {
        onSuccess: (data) => setJobId(data.jobId),
      },
    );
  };

  const downloadingRef = useRef(false);

  useEffect(() => {
    if (
      status === "completed" &&
      jobId &&
      !downloadingRef.current
    ) {
      downloadingRef.current = true;
      downloadExport(jobId)
        .then(() => {
          setJobId(null);
          setExportingCycleId(null);
        })
        .catch((e) => {
          setDownloadError(e instanceof Error ? e.message : "Download failed");
        })
        .finally(() => {
          downloadingRef.current = false;
        });
    }
  }, [status, jobId]);

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-3.5 text-sm text-destructive sm:px-6"
          role="alert"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className={UNIFIED_CARD_CLASS}>
        <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
          <div className={cn("relative", TOOLBAR_SEARCH_WIDTH)}>
            <Search
              className={cn(
                "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80 transition-opacity duration-200 ease-out motion-reduce:transition-none",
                searchInput !== debouncedSearch && "opacity-60",
              )}
              aria-hidden
            />
            <input
              ref={searchInputRef}
              type="search"
              role="searchbox"
              aria-label="Search exportable cycles"
              placeholder="Search by name or year…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={UNIFIED_SEARCH_INPUT_CLASS}
            />
            <kbd className={SHOWING_RANGE_BADGE_CLASS} aria-hidden>
              ⌘K
            </kbd>
          </div>
          {!cyclesQuery.isLoading && (
            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border/40 bg-muted/[0.04] px-2.5 py-1 font-sans text-xs font-medium text-muted-foreground/80 sm:w-auto sm:justify-start">
              {filtered.length} {filtered.length === 1 ? "cycle" : "cycles"}
            </span>
          )}
        </div>

        {cyclesQuery.isLoading ? (
          <div className="flex min-h-[8rem] items-center justify-center px-6 py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TooltipProvider delayDuration={300}>
            <div className="overflow-x-auto">
            <table className={TABLE_BASE_CLASS}>
              <thead>
                <tr className={TABLE_HEAD_ROW_CLASS}>
                  <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                    Cycle
                  </th>
                  <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                    Academic year
                  </th>
                  <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                    Closed
                  </th>
                  <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                    Ideas
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      TABLE_ACTIONS_MIN_W_2,
                      TABLE_HEAD_CELL_ACTIONS_CLASS,
                    )}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={TABLE_EMPTY_CELL_CLASS}>
                      <p className="font-sans text-sm font-medium text-foreground">
                        {debouncedSearch.trim()
                          ? "No matching cycles."
                          : "No exportable cycles."}
                      </p>
                      <p className="mt-1.5 font-sans text-xs text-muted-foreground/80">
                        {debouncedSearch.trim()
                          ? "Try another search."
                          : "Export is available after the final comment closure date."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const isThisExporting =
                      exportingCycleId === c.id && isProcessing;

                    return (
                      <tr key={c.id} className={TABLE_ROW_CLASS}>
                        <td className={TABLE_CELL_NAME_CLASS}>
                          {c.name ?? "—"}
                        </td>
                        <td className={TABLE_CELL_CLASS}>
                          {c.academicYearName}
                        </td>
                        <td
                          className={cn(
                            TABLE_CELL_CLASS,
                            "text-muted-foreground",
                          )}
                        >
                          {formatClosedDate(c.interactionClosesAt)}
                        </td>
                        <td
                          className={cn(
                            TABLE_CELL_CLASS,
                            "tabular-nums",
                          )}
                        >
                          {c.ideaCount}
                        </td>
                        <td
                          className={cn(
                            TABLE_ACTIONS_MIN_W_2,
                            TABLE_ACTIONS_CELL_CLASS,
                          )}
                        >
                          <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex shrink-0">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className={
                                      isProcessing && !isThisExporting
                                        ? ACTION_BUTTON_DISABLED_BLUR_CLASS
                                        : ACTION_BUTTON_EDIT_CLASS
                                    }
                                    disabled={
                                      isProcessing && !isThisExporting
                                    }
                                    onClick={() => handleTrigger(c.id)}
                                    aria-label={`Export ${c.name ?? c.academicYearName}`}
                                  >
                                    {isThisExporting ? (
                                      <Loader2
                                        className="size-4 animate-spin"
                                        aria-hidden
                                      />
                                    ) : (
                                      <Download
                                        className="size-4"
                                        aria-hidden
                                      />
                                    )}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {isThisExporting
                                  ? statusQuery.data?.progress != null
                                    ? `Preparing… ${Math.round(statusQuery.data.progress)}%`
                                    : "Preparing…"
                                  : "Export"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
