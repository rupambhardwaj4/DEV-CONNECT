/**
 * Deterministic job-matching scoring.
 *
 * This is a documented weighted heuristic over the mock profile and job records — it is
 * NOT a trained model, and the UI says so. Same inputs always produce the same score:
 * no randomness, no clock reads, no per-load variation.
 *
 * Formula (max 100):
 *   required skill overlap  60  * |hit| / |required|
 *   preferred skill overlap 15  * |hit| / |preferred|
 *   experience alignment    15  * level closeness (adjacent levels decay by 0.5)
 *   work-mode alignment     10  * 1.0 exact preference match, 0.5 compatible, 0 opposed
 *
 * @param {import('../types/index.js').User} developer
 * @param {import('../types/index.js').Job} job
 * @param {{ preferences?: { workMode?: string, experienceLevel?: string } }} [context]
 * @returns {import('../types/index.js').MatchResult}
 */

import { normalizeSkills, hasSkill } from './skills.js';

const LEVELS = ['junior', 'mid', 'senior', 'lead', 'principal'];

/** Skills that satisfy a role requirement even when listed as adjacent. */
const EQUIVALENCES = [
  ['React', 'Next.js'],
  ['Node.js', 'Express'],
  ['PostgreSQL', 'SQL'],
  ['MySQL', 'SQL'],
  ['MongoDB', 'NoSQL'],
  ['JavaScript', 'TypeScript'],
  ['AWS', 'Terraform'],
  ['Kubernetes', 'Docker'],
  ['Testing', 'Playwright'],
  ['Testing', 'Jest'],
];

export const MATCH_WEIGHTS = {
  required: 60,
  preferred: 15,
  experience: 15,
  workMode: 10,
};

function levelIndex(level) {
  const i = LEVELS.indexOf(String(level ?? '').toLowerCase());
  return i === -1 ? 1 : i;
}

function equivalencesFor(skill) {
  const pair = EQUIVALENCES.find((p) => p.includes(skill));
  if (!pair) return [];
  return pair.filter((s) => s !== skill && s !== 'NoSQL');
}

/**
 * A requirement counts as met when the developer lists it, or lists an equivalent that
 * normally accompanies it (e.g. Next.js covers a React requirement, TypeScript does not
 * on its own cover a JavaScript requirement in reverse — order is checked both ways).
 */
function requirementMet(developerSkills, requirement) {
  if (hasSkill(developerSkills, requirement)) return true;
  return equivalencesFor(requirement).some((alt) => hasSkill(developerSkills, alt));
}

export function scoreMatch(developer, job, context = {}) {
  const devSkills = normalizeSkills(developer?.skills);
  const required = normalizeSkills(job?.requiredSkills);
  const preferred = normalizeSkills(job?.preferredSkills);

  const matchedRequired = [];
  const missingRequired = [];
  for (const skill of required) {
    (requirementMet(devSkills, skill) ? matchedRequired : missingRequired).push(skill);
  }

  const matchedPreferred = preferred.filter((skill) => requirementMet(devSkills, skill));
  const missingPreferred = preferred.filter((skill) => !requirementMet(devSkills, skill));

  const requiredRatio = required.length ? matchedRequired.length / required.length : 1;
  const preferredRatio = preferred.length ? matchedPreferred.length / preferred.length : 0.5;

  const devLevel = String(developer?.experienceLevel ?? context.preferences?.experienceLevel ?? 'mid').toLowerCase();
  const jobLevel = String(job?.experienceLevel ?? 'mid').toLowerCase();
  const gap = Math.abs(levelIndex(devLevel) - levelIndex(jobLevel));
  const experienceRatio = gap === 0 ? 1 : gap === 1 ? 0.6 : gap === 2 ? 0.35 : 0.1;

  const wantedMode = String(context.preferences?.workMode ?? job?.workMode ?? '').toLowerCase();
  const offeredMode = String(job?.workMode ?? '').toLowerCase();
  let workModeRatio = 1;
  if (wantedMode && offeredMode && wantedMode !== 'any') {
    if (wantedMode === offeredMode) workModeRatio = 1;
    else if ([wantedMode, offeredMode].sort().join('+') === 'hybrid+remote') workModeRatio = 0.6;
    else if (wantedMode === 'onsite' || offeredMode === 'onsite') workModeRatio = 0.25;
    else workModeRatio = 0.5;
  }

  const score = Math.round(
    MATCH_WEIGHTS.required * requiredRatio +
      MATCH_WEIGHTS.preferred * preferredRatio +
      MATCH_WEIGHTS.experience * experienceRatio +
      MATCH_WEIGHTS.workMode * workModeRatio,
  );

  const band = score >= 75 ? 'strong' : score >= 55 ? 'good' : 'fair';
  const reasons = [];

  if (required.length) {
    reasons.push(
      `Covers ${matchedRequired.length} of ${required.length} required skills${
        missingRequired.length ? `, missing ${missingRequired.join(', ')}` : ' — the full stack'
      }.`,
    );
  } else {
    reasons.push('The listing does not specify required skills, so scoring leans on preferences and fit.');
  }

  if (preferred.length) {
    reasons.push(
      matchedPreferred.length
        ? `Also brings ${matchedPreferred.length} of ${preferred.length} preferred skills.`
        : `Brings none of the ${preferred.length} preferred skills.`,
    );
  }

  reasons.push(
    gap === 0
      ? `Experience level matches: ${jobLevel}.`
      : gap === 1
        ? `One level apart — the role targets ${jobLevel}, the profile reads ${devLevel}.`
        : `Level mismatch is wide: role targets ${jobLevel}, profile reads ${devLevel}.`,
  );

  if (workModeRatio < 1 && offeredMode) {
    reasons.push(`Work mode differs: this role is ${offeredMode}, preference was ${wantedMode}.`);
  }

  const recommendations = [];
  for (const skill of missingRequired.slice(0, 3)) {
    recommendations.push(`Add ${skill} evidence — a pinned project or a role that used it.`);
  }
  for (const skill of missingPreferred.slice(0, 2)) {
    recommendations.push(`${skill} is preferred here; listing it would raise the score.`);
  }
  if (gap >= 2) {
    recommendations.push(`Describe scope typical of ${jobLevel} work: ownership, scale, decisions.`);
  }
  if (workModeRatio <= 0.5) {
    recommendations.push('Widen the work-mode preference if this team is worth reaching.');
  }
  if (!recommendations.length) {
    recommendations.push('Profile is well aligned — sharpen the headline and add measurable results.');
  }

  return {
    score,
    band,
    matchedSkills: matchedRequired,
    missingSkills: missingRequired,
    partialSkills: matchedPreferred,
    reasons,
    recommendations: recommendations.slice(0, 4),
  };
}

/**
 * @param {import('../types/index.js').User} developer
 * @param {import('../types/index.js').Job[]} jobs
 * @param {object} [context]
 * @returns {Array<{ job: import('../types/index.js').Job, match: import('../types/index.js').MatchResult }>}
 */
export function rankJobs(developer, jobs, context) {
  return (jobs ?? [])
    .map((job) => ({ job, match: scoreMatch(developer, job, context) }))
    .sort((a, b) => b.match.score - a.match.score || a.job.id.localeCompare(b.job.id));
}
