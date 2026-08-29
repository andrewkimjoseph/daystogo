import { Show, SignInButton, SignUpButton } from "@clerk/tanstack-react-start";
import logoUrl from "@/assets/logo.png";
import { LocalImport } from "./LocalImport";

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-out">
        <SignedOutPrompt />
      </Show>
      <Show when="signed-in">
        <LocalImport>{children}</LocalImport>
      </Show>
    </>
  );
}

function SignedOutPrompt() {
  return (
    <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-5 bg-card p-6 text-center sm:p-12">
      <img src={logoUrl} alt="Days To Go" className="w-36 sm:w-48" />
      <h2 className="text-xl uppercase sm:text-2xl">Sign in to put a clock on it.</h2>
      <p className="max-w-sm font-bold text-muted-foreground">
        Your countdowns live in the cloud now — same board, same ticks, just yours from any
        browser.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SignInButton>
          <button
            type="button"
            className="brut-thin brut-press rounded-none bg-cream px-5 py-3 font-bold text-ink uppercase"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton>
          <button
            type="button"
            className="brut-thin brut-press rounded-none bg-primary px-5 py-3 font-bold text-primary-foreground uppercase"
          >
            Sign up
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
