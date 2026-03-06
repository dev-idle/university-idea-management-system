"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, fetchWithAuthResponse } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const POLL_INTERVAL_PENDING_MS = 2000;
const POLL_INTERVAL_PROCESSING_MS = 500;

function parseExportError(res: Response, text: string): string {
  try {
    const json = JSON.parse(text) as { message?: string };
    if (typeof json?.message === "string") return json.message;
  } catch {
    /* ignore */
  }
  return text || `Download failed (${res.status})`;
}

export interface ExportableCycle {
  id: string;
  name: string | null;
  academicYearName: string;
  interactionClosesAt: string;
  ideaCount: number;
}

export interface ExportTriggerResponse {
  jobId: string;
}

export interface ExportStatusResponse {
  status: "pending" | "waiting" | "active" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
}

/** List exportable proposal cycles (closed + interactionClosesAt passed). */
export function useExportableCyclesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.export.cycles(),
    queryFn: async () => {
      const data = await fetchWithAuth<ExportableCycle[]>("export/cycles");
      return Array.isArray(data) ? data : [];
    },
    enabled: options?.enabled !== false,
  });
}

export type ExportType = "full";

/** Trigger export job for a cycle. Returns jobId. */
export function useExportTriggerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cycleId, type }: { cycleId: string; type: ExportType }) => {
      const res = await fetchWithAuth<ExportTriggerResponse>("export/trigger", {
        method: "POST",
        body: JSON.stringify({ cycleId, type }),
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.export.all });
    },
  });
}

/** Poll export job status. Refetch every 2s when processing. */
export function useExportStatusQuery(jobId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.export.status(jobId ?? ""),
    queryFn: async () => {
      const data = await fetchWithAuth<ExportStatusResponse>(`export/${jobId}/status`);
      return data;
    },
    enabled: (options?.enabled !== false) && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const progress = query.state.data?.progress ?? 0;
      if (status === "completed" || status === "failed") return false;
      if (status === "processing" || status === "active" || progress >= 99) {
        return POLL_INTERVAL_PROCESSING_MS;
      }
      return POLL_INTERVAL_PENDING_MS;
    },
  });
}

/** Download export file (streamed from backend, proper filename via Content-Disposition). */
export async function downloadExport(jobId: string): Promise<void> {
  const res = await fetchWithAuthResponse(`export/${jobId}/download`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseExportError(res, text));
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^";\n]+)"?/);
  const filename = match?.[1]?.replace(/\\"/g, '"') ?? `export-${jobId}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.setAttribute("download", filename);
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
