import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/tanstack-react-start";

const brutBtn =
  "brut brut-press inline-flex h-10 items-center justify-center rounded-none px-2.5 text-xs font-bold uppercase sm:h-auto sm:px-4 sm:py-2 sm:text-sm";

export function AuthControls() {
  return (
    <>
      <Show when="signed-out">
        <span className="contents">
          <SignInButton>
            <button type="button" className={`${brutBtn} bg-cream text-ink`}>
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              type="button"
              className={`${brutBtn} bg-primary text-primary-foreground`}
            >
              Sign up
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
