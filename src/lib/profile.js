/**
 * Profile completion, shared by the offline store and the API.
 *
 * The checklist is a deterministic count of filled required fields — it is what tells a
 * candidate their profile is thin, so the same rules must produce the same percentage on the
 * served path. `hasProject` is passed in because projects belong to the caller's store.
 */

const REQUIRED_PROFILE_FIELDS = [
  ['name', (u) => u.name],
  ['headline', (u) => u.headline],
  ['location', (u) => u.location],
  ['bio', (u) => u.bio],
  ['skills', (u) => (u.skills ?? []).length >= 3],
  ['experience', (u) => (u.experience ?? []).length >= 1],
  ['education', (u) => (u.education ?? []).length >= 1],
  ['project', (_u, hasProject) => hasProject],
  ['website', (u) => Boolean(u.website || u.linkedIn || u.githubUsername)],
];

/** @returns {{ percent: number, missing: string[] }} */
export function computeProfileCompletion(user, hasProject = false) {
  if (!user) return { percent: 0, missing: [] };
  const missing = REQUIRED_PROFILE_FIELDS.filter(([, check]) => !check(user, hasProject)).map(([label]) => label);
  const percent = Math.round(((REQUIRED_PROFILE_FIELDS.length - missing.length) / REQUIRED_PROFILE_FIELDS.length) * 100);
  return { percent, missing };
}
