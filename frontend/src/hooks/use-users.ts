"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  UserListItem,
  UsersListResponse,
  CreateUserBody,
  UpdateUserBody,
} from "@/lib/schemas/users.schema";
import { usersListResponseSchema } from "@/lib/schemas/users.schema";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parseUsersList(data: unknown): UsersListResponse {
  const parsed = usersListResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid users list response");
  return parsed.data;
}

/** List users (paginated). Backend enforces USERS permission. */
export function useUsersListQuery(params?: { page: number; limit: number }) {
  const page = params?.page ?? DEFAULT_PAGE;
  const limit = params?.limit ?? DEFAULT_LIMIT;

  return useQuery({
    queryKey: queryKeys.users.list({ page, limit }),
    queryFn: async () => {
      const res = await fetchWithAuth<UsersListResponse>(
        `users?page=${page}&limit=${limit}`
      );
      return parseUsersList(res);
    },
    enabled: true,
  });
}

/** Create user. Backend enforces USERS permission and validation. */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateUserBody) => {
      const res = await fetchWithAuth<UserListItem>("users", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res as UserListItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/** Update user isActive. Optimistic update; backend enforces USERS permission. */
export function useUpdateUserIsActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: { id: string; body: UpdateUserBody }) => {
      const res = await fetchWithAuth<UserListItem>(`users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res as UserListItem;
    },
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });
      const previous = queryClient.getQueriesData<UsersListResponse>({
        queryKey: queryKeys.users.all,
      });
      queryClient.setQueriesData<UsersListResponse>(
        { queryKey: queryKeys.users.all },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((u) =>
              u.id === id ? { ...u, isActive: body.isActive } : u
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
