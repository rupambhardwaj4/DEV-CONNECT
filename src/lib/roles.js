/**
 * Role semantics for the whole app, in one place.
 *
 * `superuser` is the review account's role. It is not a third workspace: it acts as both
 * developer and recruiter, so capability questions go through here instead of comparing
 * role strings at each call site — which is how a new role gets forgotten.
 */

/** @param {string|null|undefined} role @param {'developer'|'recruiter'} capability */
export function actsAs(role, capability) {
  return role === capability || role === 'superuser';
}
