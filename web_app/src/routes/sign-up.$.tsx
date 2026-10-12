import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { CLERK_ENABLED } from "@/lib/authMode";

export const Route = createFileRoute("/sign-up/$")({
  component: Page,
});

function Page() {
  if (!CLERK_ENABLED) return <SignUpUnavailable />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <SignUp />
    </div>
  );
}

function SignUpUnavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="brut flex max-w-md flex-col items-center gap-5 bg-card p-8 text-center">
        <h1 className="text-2xl uppercase">Sign-up isn't set up</h1>
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
