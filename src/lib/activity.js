/**
 * Activity sentences, shared by the offline store and the API.
 *
 * One template table means a notification feed reads identically whether the rows came from
 * localStorage or Postgres. The two lookups a template needs (a name for an id, a title for a
 * job id) are injected, because only the caller knows which store to read them from.
 */

const ACTIVITY_TEMPLATES = {
  'viewed-profile': (a, me, see) =>
    a.targetId === me ? `${a.actor.name} viewed your profile` : `You viewed ${see.nameOf(a.targetId)}'s profile`,
  'posted-job': (a, me, see) => `${a.actor.name} posted “${see.jobTitleOf(a.targetId) ?? 'a new role'}”`,
  'sent-request': (a, me, see) =>
    a.targetId === me
      ? `${a.actor.name} sent you a connection request`
      : `You sent a connection request to ${see.nameOf(a.targetId)}`,
  'accepted-request': (a, me) =>
    a.targetId === me
      ? `${a.actor.name} accepted your connection request`
      : `You accepted ${a.actor.name}'s request`,
  applied: (a, me, see) => {
    const title = see.jobTitleOf(a.targetId) ?? 'a role';
    return a.actorId === me ? `You applied to “${title}”` : `${a.actor.name} applied to “${title}”`;
  },
  'starred-repo': (a) => `${a.actor.name} starred ${String(a.targetId).replace(/^repo-/, '')}`,
};

/**
 * Turns a bare activity row into a sentence. Unknown kinds are skipped, not guessed.
 * @param {{ kind: string, actorId: string, targetId: string, actor?: { name: string } }} activity
 * @param {string} viewerId
 * @param {{ nameOf: (id: string) => string, jobTitleOf: (id: string) => string|null }} see
 */
export function describeActivity(activity, viewerId, see) {
  const template = ACTIVITY_TEMPLATES[activity.kind];
  if (!template || !activity.actor) return null;
  return template(activity, viewerId, see);
}
