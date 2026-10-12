import type { ReactNode } from "react";

/** Throwaway stub: lets the UI render locally with no sign-in keys set. */
export function ClerkProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return { isSignedIn: false, isLoaded: true, userId: null, sessionId: null, has: () => false };
}

export function useUser() {
  return { user: null, isLoaded: true, isSignedIn: false };
}

export function useClerk() {
  return { openSignIn: () => {}, openUserProfile: () => {}, signIn: {} };
}

export function SignIn() {
  return null;
}

export function SignUp() {
  return null;
}

export function Show() {
  return null;
}

export function UserButton() {
  return null;
}

export function SignInButton({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function SignUpButton({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function ClerkLoading() {
  return null;
}

export function ClerkLoaded({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
