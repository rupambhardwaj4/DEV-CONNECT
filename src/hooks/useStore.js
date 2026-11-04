/**
 * React bindings for the mock store.
 *
 * `useStore` subscribes to the store snapshot, so any mutation — from this page or
 * anywhere else — re-renders every consumer with consistent data. Reads are synchronous,
 * so pages get a value on first render instead of a skeleton flash for data already in
 * memory.
 *
 * Every derived hook below goes through `useStoreValue`, which memoizes off the snapshot
 * identity. Handing `useSyncExternalStore` a selector that returns a fresh object would
 * re-render forever, since React compares snapshots by identity.
 */

import { useMemo, useSyncExternalStore } from 'react';
import * as store from '../data/store.js';
import { loadSession, saveSession, loadPrefs, savePrefs } from '../lib/storage.js';

const subscribe = (onChange) => store.subscribe(onChange);

/** @returns {import('../types/index.js').StoreSnapshot} */
export function useStore() {
  return useSyncExternalStore(subscribe, store.getSnapshot, store.getSnapshot);
}

/** @param {(snapshot: any) => any} select */
export function useStoreValue(select, deps = []) {
  const snapshot = useStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => select(snapshot), [snapshot, ...deps]);
}

export function useNotificationCount(userId) {
  return useStoreValue(() => (userId ? store.getNotificationCount(userId) : 0), [userId]);
}

export function useJobs(params) {
  return useStoreValue(() => store.queryJobs(params), [JSON.stringify(params)]);
}

export function useJob(id) {
  return useStoreValue(() => store.getJobDetail(id), [id]);
}

export function useDeveloper(id, viewerId) {
  return useStoreValue(() => store.getDeveloperDetail(id, viewerId), [id, viewerId]);
}

export function useConnectionState(viewerId, otherId) {
  return useStoreValue(() => store.getConnectionState(viewerId, otherId), [viewerId, otherId]);
}

export function useProfile(user) {
  return useStoreValue(() => store.computeProfileCompletion(user), [user?.id, user]);
}

export { store, loadSession, saveSession, loadPrefs, savePrefs };
