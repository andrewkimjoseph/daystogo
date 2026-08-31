/** Written during AuthGate render so the first query never hits Neon as a guest. */
let usesCloud = false;
let sessionSyncedUserId: string | null = null;
let sessionSync: { userId: string; promise: Promise<void> } | null = null;

export function setUsesCloud(next: boolean) {
  if (!next) {
    sessionSyncedUserId = null;
    sessionSync = null;
  }
  usesCloud = next;
}

export function isCloudSync(): boolean {
  return usesCloud;
}

export function countdownSource(): "cloud" | "local" {
  return usesCloud ? "cloud" : "local";
}

export function hasSessionSynced(userId?: string): boolean {
  if (!sessionSyncedUserId) return false;
  return userId == null || sessionSyncedUserId === userId;
}

/** True while a session sync is running or already finished — skip a second Neon reconcile. */
export function shouldSkipCloudReconcile(): boolean {
  return sessionSyncedUserId != null || sessionSync != null;
}

export function resetSessionSync(): void {
  sessionSyncedUserId = null;
  sessionSync = null;
}

async function withAuthRetry<T>(work: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  try {
    return await work();
  } catch (error) {
    const isAuthRace = error instanceof Error && error.message === "Unauthorized";
    if (!isAuthRace || retries === 0) throw error;
    await new Promise((r) => setTimeout(r, delayMs));
    return withAuthRetry(work, retries - 1, delayMs);
  }
}

/** One Dexie/Neon sync per signed-in tab session. Later callers share the same promise. */
export function runSessionSync(userId: string, work: () => Promise<void>): Promise<void> {
  if (sessionSyncedUserId === userId) return Promise.resolve();
  if (sessionSync?.userId === userId) return sessionSync.promise;

  const promise = withAuthRetry(work)
    .then(() => {
      sessionSyncedUserId = userId;
    })
    .finally(() => {
      if (sessionSync?.promise === promise) sessionSync = null;
    });
  sessionSync = { userId, promise };
  return promise;
}
