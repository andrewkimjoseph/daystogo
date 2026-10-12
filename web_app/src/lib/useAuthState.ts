import { useAuth } from "@clerk/tanstack-react-start";
import { CLERK_ENABLED } from "./authMode";

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
}

/**
 * `useAuth` that never throws when sign-in isn't configured. CLERK_ENABLED is a
 * build-time constant, so every render of a given build takes the same branch.
 */
export function useAuthState(): AuthState {
  if (!CLERK_ENABLED) return { isLoaded: true, isSignedIn: false, userId: null };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isLoaded, isSignedIn, userId } = useAuth();
  return { isLoaded, isSignedIn, userId };
}
