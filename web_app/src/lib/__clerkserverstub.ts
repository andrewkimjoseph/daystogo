import { createMiddleware } from "@tanstack/react-start";

/** Throwaway stub: passes requests through with no sign-in keys set. */
export function clerkMiddleware() {
  return createMiddleware().server(async ({ next }) => next());
}

export async function auth() {
  return { userId: null, sessionId: null, getToken: async () => null };
}

export function clerkClient() {
  return {
    users: {
      getUser: async () => null,
      updateUser: async () => ({}),
    },
  };
}
