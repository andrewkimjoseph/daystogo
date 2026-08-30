/** Written during AuthGate render so the first query never hits Neon as a guest. */
let usesCloud = false;

export function setUsesCloud(next: boolean) {
  usesCloud = next;
}

export function isCloudSync(): boolean {
  return usesCloud;
}

export function countdownSource(): "cloud" | "local" {
  return usesCloud ? "cloud" : "local";
}
