/**
 * Versioned localStorage engine for the mock data layer.
 *
 * Reads never throw: unreadable, malformed, or stale-schema payloads fall back to a
 * freshly seeded snapshot so a half-written cache cannot blank the app. Writes that
 * localStorage refuses (private mode, quota) degrade to an in-memory snapshot for the
 * rest of the session and are reported once, not silently swallowed.
 */

const PREFIX = 'devconnect';
// The two transports must not read each other's cache: switching VITE_DATA_SOURCE would otherwise
// hand the offline demo the blank store an api session left behind, or a served user a fake session.
const NAMESPACE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'served' : 'local';
const SNAPSHOT_KEY = `${PREFIX}:${NAMESPACE}:snapshot`;
const SESSION_KEY = `${PREFIX}:${NAMESPACE}:session`;
const PREFS_KEY = `${PREFIX}:prefs`;

/** Bump when the snapshot shape changes incompatibly; old payloads are discarded. */
export const SCHEMA_VERSION = 4;

let memoryFallback = null;
let warnedWriteFailure = false;

function storageAvailable() {
  try {
    const probe = `${PREFIX}:__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const canPersist = typeof window !== 'undefined' && storageAvailable();

function safeRead(key) {
  try {
    const raw = canPersist ? window.localStorage.getItem(key) : memoryFallback?.[key];
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  if (!canPersist) {
    memoryFallback = memoryFallback ?? {};
    memoryFallback[key] = value;
    return true;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    if (!warnedWriteFailure) {
      warnedWriteFailure = true;
      // Surfaced in Settings → Diagnostics rather than thrown, so one write failure
      // cannot break an otherwise working demo session.
    }
    memoryFallback = memoryFallback ?? {};
    memoryFallback[key] = value;
    return false;
  }
}

export const STORAGE_KEYS = { SNAPSHOT_KEY, SESSION_KEY, PREFS_KEY, PREFIX };

/**
 * @param {() => import('../types/index.js').StoreSnapshot} seed
 * @returns {import('../types/index.js').StoreSnapshot}
 */
export function loadSnapshot(seed) {
  const stored = safeRead(SNAPSHOT_KEY);
  // A stored payload is only reused when it matches the current schema version and
  // carries every collection the seed defines. A partial snapshot left by an older
  // build would otherwise pass a users/jobs-only check and crash a page that reads a
  // collection added later, so completeness is verified against the seed's own shape.
  if (stored && typeof stored === 'object' && stored.schemaVersion === SCHEMA_VERSION) {
    const template = seed();
    const complete = Object.keys(template).every(
      (key) => !Array.isArray(template[key]) || Array.isArray(stored[key]),
    );
    if (complete) return stored;
  }

  // Discards unreadable, outdated, or incomplete payloads; seeding is idempotent.
  const fresh = { ...seed(), schemaVersion: SCHEMA_VERSION };
  safeWrite(SNAPSHOT_KEY, fresh);
  return fresh;
}

/** @param {import('../types/index.js').StoreSnapshot} snapshot */
export function saveSnapshot(snapshot) {
  return safeWrite(SNAPSHOT_KEY, { ...snapshot, schemaVersion: SCHEMA_VERSION });
}

export function clearSnapshot() {
  try {
    if (canPersist) window.localStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    /* nothing recoverable to do */
  }
  if (memoryFallback) delete memoryFallback[SNAPSHOT_KEY];
}

/** Demo session, kept separate so logout never touches entity data. */
export function loadSession() {
  const stored = safeRead(SESSION_KEY);
  return stored && typeof stored.userId === 'string' ? stored : null;
}

/** @param {{ userId: string, role: string, remember: boolean, startedAt: string }|null} session */
export function saveSession(session) {
  return safeWrite(SESSION_KEY, session);
}

export function loadPrefs(fallback = {}) {
  return { ...fallback, ...(safeRead(PREFS_KEY) ?? {}) };
}

export function savePrefs(prefs) {
  return safeWrite(PREFS_KEY, prefs);
}

/** Lets the UI tell the user their changes will not survive a refresh. */
export function isPersistenceAvailable() {
  return canPersist;
}
