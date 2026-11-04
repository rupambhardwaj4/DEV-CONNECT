/**
 * Business rules shared with the client, imported rather than duplicated.
 *
 * Role capability semantics and the deterministic matcher live in the app's `src/lib`, and the
 * synopsis requires one scoring baseline with a deterministic path. Re-exporting from here keeps
 * a job's score identical whether it is computed for a REST response or re-rendered offline,
 * which is the property that makes the numbers defensible in review.
 */

export { actsAs } from '../../src/lib/roles.js';
export { scoreMatch, rankJobs, MATCH_WEIGHTS } from '../../src/lib/matching.js';
export { normalizeSkills, hasSkill } from '../../src/lib/skills.js';
export { describeActivity } from '../../src/lib/activity.js';
export { computeProfileCompletion } from '../../src/lib/profile.js';

