/** Collision-safe public ids for rows the client used to generate locally. */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function publicId(prefix) {
  let suffix = '';
  while (suffix.length < 10) suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `${prefix}-${suffix}`;
}

/** Deterministic slug for a user-supplied entity, mirroring the seed data's style. */
export function slugify(text, prefix) {
  const slug = String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return `${prefix}-${slug || publicId('x')}`;
}
