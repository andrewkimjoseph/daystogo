# Center the guest-limit panel on /create-countdown

The "One clock per stranger." panel currently sits against the top of the page, right under
the "Back to the timers" button, with a large empty area below it. It should sit in the middle
of the space beneath the header instead.

## What changes

**1. `/create-countdown` page fills the screen height** (`web_app/src/routes/create-countdown.tsx`)

The page wrapper becomes a full-height column and the content area below the "Back to the
timers" button is allowed to grow, the same way the home page already works:

```text
div (full viewport height, column)
  SiteHeader
  main (grows to fill the rest)
    "Back to the timers" row
    content area (grows)  <-- panel centres inside this
```

**2. The panel centres itself in that grown area** (`web_app/src/components/CreateCountdownForm.tsx`)

When the guest limit is reached, the panel is wrapped in a container that stretches to the
available height and centres the card both ways. The card keeps its own size and styling —
only its position changes.

## Notes

- The panel is already horizontally centred within the page's content column. It sits about
  8px left of the exact screen centre because the whole site reserves space for a scrollbar
  (`scrollbar-gutter: stable`) so nothing jumps when a page gets long. That stays — it keeps
  this panel lined up with the header, the cards and the calendar.
- Nothing else on the page moves: the form, the date/time picker, the back button and the
  "Keep editing this one" dismiss all behave as before.
- On short screens the panel keeps a small margin and scrolls normally rather than being
  squeezed.

## Verification

Open the page as a signed-out visitor who already has one countdown, trigger the panel, and
measure its centre against the screen centre at desktop (1280x900) and phone (390x844) sizes,
with screenshots to confirm.
