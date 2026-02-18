"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth.store";

const NOTIFICATION_LIMIT = 15;

export interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function parseNotification(data: unknown): Notification {
  const obj = data as Record<string, unknown>;
  if (
    typeof obj?.id !== "string" ||
    typeof obj?.type !== "string" ||
    typeof obj?.message !== "string" ||
    typeof obj?.isRead !== "boolean" ||
    typeof obj?.createdAt !== "string"
  ) {
    throw new Error("Invalid notification response");
  }
  return {
    id: obj.id,
    type: obj.type,
    message: obj.message,
    link: typeof obj.link === "string" ? obj.link : obj.link ?? null,
    isRead: obj.isRead,
    createdAt: obj.createdAt,
  };
}

export function useNotificationsQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.notifications.list(NOTIFICATION_LIMIT),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>(
        `notifications?limit=${NOTIFICATION_LIMIT}`
      );
      const arr = Array.isArray(data) ? data : [];
      return arr.map(parseNotification);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useUnreadCountQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const data = await fetchWithAuth<{ count: number }>(
        "notifications/unread-count"
      );
      return typeof data?.count === "number" ? data.count : 0;
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
