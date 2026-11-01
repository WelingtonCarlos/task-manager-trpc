import "server-only";
import { createContext } from "./context";
import { createCaller } from "./routers/_app";

/** Used by Server Components (SSR) to call the same procedures the client reaches over HTTP. */
export const api = createCaller(createContext());
