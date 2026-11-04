import { publicId } from './ids.js';

/**
 * Notification fan-out.
 *
 * The demo layer used to hand-write every notification row; on the server they are a
 * consequence of a state change, so an applicant move cannot be recorded without the
 * recipient being told. Mail transport is deliberately not part of this module — the
 * notification centre is the delivery surface.
 */
export async function notify(tx, { userId, kind, title, body, href = null, relatedId = null }) {
  const row = await tx.notification.create({
    data: { id: publicId('ntf'), userId, kind, title, body, href, relatedId },
  });
  return row;
}

export async function recordActivity(tx, { actorId, kind, targetId }) {
  return tx.activityEvent.create({
    data: { id: publicId('act'), actorId, kind, targetId, at: new Date() },
  });
}
