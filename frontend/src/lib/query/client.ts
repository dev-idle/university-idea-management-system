import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 60 * 1000; // 1 minute
const GC_TIME = 5 * 60 * 1000; // 5 minutes (formerly cacheTime)

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
      },
      mutations: {},
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
