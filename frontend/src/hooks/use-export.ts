"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, fetchWithAuthResponse } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

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
  status: "waiting" | "active" | "processing" | "completed" | "failed";
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

export type ExportType = "csv" | "documents";

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
      if (status === "processing" || status === "active" || status === "waiting") {
        return 2000;
      }
      return false;
    },
  });
}

/** Download export file (proxied from Cloudinary with proper filename). */
export async function downloadExport(jobId: string): Promise<void> {
  const res = await fetchWithAuthResponse(`export/${jobId}/download`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^";\n]+)"?/);
  const filename = match?.[1]?.replace(/\\"/g, '"') ?? `export-${jobId}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
