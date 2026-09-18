export const SITE_URL = "https://daystogo.xyz";
export const APP_URL = "https://app.daystogo.xyz";
export const GITHUB_URL = "https://github.com/andrewkimjoseph/daystogo";

export function createCountdownUrl(date?: string): string {
  if (!date) return `${APP_URL}/create-countdown`;
  return `${APP_URL}/create-countdown?date=${encodeURIComponent(date)}`;
}

export const socialLinks = {
  email: "andrewkimjoseph@gmail.com",
  github: "https://github.com/andrewkimjoseph",
  linkedin: "https://www.linkedin.com/in/andrew-kim-joseph/",
  x: "https://x.com/andrewkimjoseph",
} as const;
