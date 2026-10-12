import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

/**
 * Clerk's middleware throws on every request when no secret key is set, which
 * would blank the whole site. With no key it is simply left out and the app
 * serves its local-only mode; a deployment that sets the key is unchanged.
 */
function hasClerkSecret(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY?.trim());
}

export const startInstance = createStart(() => ({
  requestMiddleware: [
    errorMiddleware,
    ...(hasClerkSecret() ? [clerkMiddleware()] : []),
    csrfMiddleware,
  ],
}));
