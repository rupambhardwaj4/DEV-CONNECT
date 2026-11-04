/**
 * HTTP transport for the served data source.
 *
 * Two switches decide what the app does: `VITE_DATA_SOURCE` picks the transport (`local` keeps
 * the offline localStorage demo, `api` uses Express + Postgres) and `VITE_API_BASE_URL` says
 * where the API lives. Reads never go through here: `/auth/session` hands the browser the whole
 * snapshot and every write answers with the collections it touched, so the render store stays
 * the single synchronous source the pages read.
 */

import * as store from '../data/store.js';

const trim = (value) => String(value ?? '').replace(/\/+$/, '');

export const API_BASE = trim(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3000/api/v1';

/** @returns {'api' | 'local'} */
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'local';

export const usingApi = () => DATA_SOURCE === 'api';

export class ApiRequestError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * The credential is an HttpOnly cookie the browser attaches itself; no token is ever read
 * into JavaScript, which is the point of moving auth server-side.
 */
export async function request(method, path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers:
      body === undefined
        ? { Accept: 'application/json' }
        : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      payload?.code ?? 'request_failed',
      payload?.error ?? `The API answered ${response.status} for ${method} ${path}.`,
      payload?.details,
    );
  }

  if (payload?.snapshot) store.hydrate(payload.snapshot);
  else if (payload?.patch) store.applyPatch(payload.patch);
  return payload;
}

/** Who is signed in, according to the cookie — and the workspace that belongs to them. */
export function fetchSession() {
  return request('GET', '/auth/session');
}

export function describeError(error) {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof TypeError) return `Cannot reach the API at ${API_BASE}. Is the server running?`;
  return error?.message ?? 'Something went wrong.';
}
