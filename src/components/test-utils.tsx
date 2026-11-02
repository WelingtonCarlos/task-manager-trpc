import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { httpBatchLink } from "@trpc/client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { ReactElement } from "react";
import { appRouter } from "@/server/routers/_app";
import type { TaskStore } from "@/server/task-store";
import { trpc } from "@/trpc/client";

/**
 * Renders a component with the real tRPC hooks wired to the real router and an isolated store,
 * so component tests exercise the whole path without a server. `beforeResponse` lets a test hold
 * a request in flight.
 */
export function renderWithTrpc(
  ui: ReactElement,
  store: TaskStore,
  beforeResponse: (url: string) => Promise<void> = async () => {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5_000, retry: false } },
  });
  const client = trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://test/api/trpc",
        fetch: async (url, init) => {
          const response = await fetchRequestHandler({
            endpoint: "/api/trpc",
            req: new Request(url, init as RequestInit),
            router: appRouter,
            createContext: () => ({ store }),
          });
          await beforeResponse(String(url));
          return response;
        },
      }),
    ],
  });

  return render(
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </trpc.Provider>,
  );
}

/** jsdom has no IntersectionObserver; this stub lets a test scroll the sentinel into view by hand. */
export function stubIntersectionObserver() {
  const active = new Set<IntersectionObserverCallback>();

  class StubIntersectionObserver {
    constructor(private readonly callback: IntersectionObserverCallback) {}
    observe() {
      active.add(this.callback);
    }
    disconnect() {
      active.delete(this.callback);
    }
  }
  globalThis.IntersectionObserver = StubIntersectionObserver as unknown as typeof IntersectionObserver;

  return {
    intersect() {
      for (const callback of active) {
        callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      }
    },
  };
}
