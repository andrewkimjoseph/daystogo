import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/$")({
  component: Page,
});

function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <SignIn />
    </div>
  );
}
