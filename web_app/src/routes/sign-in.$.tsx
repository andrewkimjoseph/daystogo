import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { CLERK_ENABLED } from "@/lib/authMode";

export const Route = createFileRoute("/sign-in/$")({
  component: Page,
});

function Page() {
  if (!CLERK_ENABLED) return <SignInUnavailable />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <SignIn />
    </div>
  );
}

function SignInUnavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="brut flex max-w-md flex-col items-center gap-5 bg-card p-8 text-center">
        <h1 className="text-2xl uppercase">Sign-in isn't set up</h1>
        <p className="font-bold text-muted-foreground">
          This copy of Days To Go has no sign-in keys, so clocks live in this browser only.
        </p>
        <Link
          to="/"
          className="brut-thin brut-press rounded-none bg-primary px-5 py-3 font-bold text-primary-foreground uppercase"
        >
          Back to the board
        </Link>
      </div>
    </div>
  );
}
