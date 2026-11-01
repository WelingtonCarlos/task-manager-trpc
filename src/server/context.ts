/**
 * Builds the context shared by every tRPC procedure.
 *
 * Dependencies are injected here instead of being imported by the procedures,
 * which keeps procedures easy to test with isolated instances.
 */
export function createContext() {
  return {};
}

export type Context = ReturnType<typeof createContext>;
