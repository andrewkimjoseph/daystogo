# "Back to the timers" returns to where you came from

## What changes
- On an expanded countdown and on Create countdown, "Back to the timers" takes you to the exact page you came from, including its filter — e.g. back to `/?category=travel`, `/archived?category=work`, or the Calendar.
- If you opened the page directly (a shared link or a new tab, with nothing to go back to), the button still takes you to the board.
- The button keeps its look and label.

## Technical details
- In `countdowns.$countdownId.tsx` and `create-countdown.tsx`, keep the `<Link to="/">` as the fallback href, but on click (when the router history has a previous in-app entry, `window.history.state` index > 0 / `router.history.canGoBack()`) prevent default and call `router.history.back()`.
- Verify with Playwright: open `/?category=x`, go to a countdown, press the button and confirm the URL returns to `/?category=x`; open a countdown directly and confirm it lands on `/`.
