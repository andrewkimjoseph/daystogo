import { LogIn, UserPlus } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/tanstack-react-start";

const brutBtn =
  "brut brut-press inline-flex h-10 items-center justify-center rounded-none px-2.5 text-xs font-bold uppercase sm:h-auto sm:px-4 sm:py-2 sm:text-sm";

export function AuthControls() {
  return (
    <>
      <Show when="signed-out">
        <span className="contents">
          <SignInButton>
            <button
              type="button"
              title="Sign in"
              aria-label="Sign in"
              className={`${brutBtn} bg-cream text-ink`}
            >
              <LogIn className="size-4 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              type="button"
              title="Sign up"
              aria-label="Sign up"
              className={`${brutBtn} bg-primary text-primary-foreground`}
            >
              <UserPlus className="size-4 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Sign up</span>
            </button>
          </SignUpButton>
        </span>
      </Show>
      <Show when="signed-in">
        <div className="brut-thin brut-press h-11 w-11 shrink-0 overflow-hidden bg-card">
          <UserButton
            appearance={{
              elements: {
                userButtonBox: "size-full",
                userButtonTrigger:
                  "flex size-full items-center justify-center rounded-none p-0 focus:shadow-none",
                userButtonAvatarBox: "size-full rounded-none",
                avatarBox: "size-full rounded-none",
                userButtonAvatarImage: "rounded-none",
              },
            }}
          />
        </div>
      </Show>
    </>
  );
}
