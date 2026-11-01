"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import type { AppRouter } from "@/server/routers/_app";

/** Typed React hooks generated from the router type, e.g. `trpc.task.list.useQuery(...)`. */
export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // Created inside state so each browser session gets its own client and SSR never shares one between requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Data arrives pre-loaded from SSR, so don't refetch it immediately on mount.
          queries: { staleTime: 5_000, retry: false },
        },
      }),
  );
  const [trpcClient] = useState(() => trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc" })] }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
