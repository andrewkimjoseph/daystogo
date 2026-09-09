import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up/$")({
  component: Page,
});

function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <SignUp />
    </div>
  );
}
