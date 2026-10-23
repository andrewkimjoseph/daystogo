import { describe, it, expect } from "vitest";
import { formatRemaining } from "./formatTime";
const ms = (d: number, h = 0, m = 0, s = 0) => ((d * 24 + h) * 3600 + m * 60 + s) * 1000;
describe("days mode", () => {
  it("75 days", () => expect(formatRemaining(ms(75, 13, 29), 0, ms(75, 13, 29), "days").text).toBe("75 days 13:29:00"));
  it("1 day", () => expect(formatRemaining(ms(1, 2), 0, ms(1, 2), "days").text).toBe("1 day 02:00:00"));
  it("under a day", () => expect(formatRemaining(ms(0, 5), 0, ms(0, 5), "days").text).toBe("05:00:00"));
});
