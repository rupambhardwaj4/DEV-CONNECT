import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { actsAs } from '../lib/roles.js';
import { store, useStore } from '../hooks/useStore.js';
import { loadSession, saveSession } from '../lib/storage.js';
import { API_BASE, describeError, fetchSession, request, usingApi } from '../services/apiClient.js';

const AuthContext = createContext(null);

/**
 * Session handling for both data sources.
 *
 * `VITE_DATA_SOURCE=local` (the default) keeps the offline demonstration: credentials are
 * compared against seed data and the stored "token" is a marker, not a credential — nothing here
 * secures anything and no screen should imply it does.
 *
 * `VITE_DATA_SOURCE=api` replaces that with a real one: the server issues a signed JWT in an
 * HttpOnly cookie, the browser never reads it, and boot asks the API who the cookie belongs to
 * instead of trusting localStorage. Every branch below is the same contract, two transports.
 */
export function AuthProvider({ children }) {
  // Subscribing to the snapshot is what makes `user` re-derive after a profile edit.
  useStore();

  // With a served session, localStorage cannot answer "am I signed in" — only the cookie can.
  const [session, setSession] = useState(() => (usingApi() ? null : loadSession()));
  const [status, setStatus] = useState(() => {
    if (usingApi()) return 'pending';
    return loadSession() ? 'authenticated' : 'idle';
  });
  const [error, setError] = useState(null);

  const user = session?.userId ? store.getUser(session.userId) : null;

  const beginSession = useCallback((record) => {
    saveSession(record);
    setSession(record);
    setStatus('authenticated');
  }, []);

  /** The cookie is authoritative, so it decides whether a refresh carries on or starts signed out. */
  useEffect(() => {
    if (!usingApi()) return;
    let cancelled = false;
    fetchSession()
      .then((document) => {
        if (cancelled) return;
        setSession({ userId: document.user.id, role: document.user.role, startedAt: new Date().toISOString() });
        setStatus('authenticated');
      })
      .catch((caught) => {
        if (cancelled) return;
        store.clearServedData();
        saveSession(null);
        setSession(null);
        setStatus('signedOut');
        // A 401 is simply "no session yet"; anything else (the API is not running, the origin
        // is not allowed) has to be said out loud or the login screen looks broken for no reason.
        setError(caught?.status === 401 ? null : describeError(caught));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openWorkspace = useCallback(
    async (record) => {
      await fetchSession();
      beginSession({ ...record, startedAt: new Date().toISOString() });
      return { ok: true };
    },
    [beginSession],
  );

  const login = useCallback(
    async ({ email, password, remember = true }) => {
      setStatus('pending');
      setError(null);

      if (usingApi()) {
        try {
          const document = await request('POST', '/auth/login', { email, password });
          await openWorkspace({ userId: document.user.id, role: document.user.role, remember });
          return { ok: true, user: document.user };
        } catch (caught) {
          setStatus('error');
          setError(describeError(caught));
          return { ok: false, error: describeError(caught) };
        }
      }

      const result = store.checkCredentials(email, password);
      await new Promise((resolve) => setTimeout(resolve, 260));
      if (!result.ok) {
        setStatus('error');
        setError(result.error);
        return result;
      }
      beginSession({
        userId: result.user.id,
        role: result.user.role,
        remember,
        startedAt: new Date().toISOString(),
        // Marker only — the served transport is the one that holds a signed credential.
        token: `demo-session-${result.user.id}`,
      });
      return result;
    },
    [beginSession, openWorkspace],
  );

  /**
   * One-click sign-in for the sample accounts. The credential comes from the published demo
   * list, not from the render store — on the sign-in screen that store is empty in served mode,
   * because the snapshot only arrives with a session.
   */
  const loginAsDemo = useCallback(
    (account) => {
      if (!account?.email) return Promise.resolve({ ok: false, error: 'That demo account is unavailable.' });
      return login({ email: account.email, password: account.password, remember: true });
    },
    [login],
  );

  const register = useCallback(
    async ({ name, email, password, role, headline, location, companyName }) => {
      setStatus('pending');
      setError(null);

      if (usingApi()) {
        try {
          const document = await request('POST', '/auth/register', { name, email, password, role, headline, location, companyName });
          await openWorkspace({ userId: document.user.id, role: document.user.role, remember: true });
          return { ok: true, user: document.user };
        } catch (caught) {
          setStatus('error');
          setError(describeError(caught));
          return { ok: false, error: describeError(caught) };
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 260));
      const result = store.registerUser({ name, email, password, role, headline, location });
      if (!result.ok) {
        setStatus('error');
        setError(result.error);
        return result;
      }
      beginSession({
        userId: result.user.id,
        role: result.user.role,
        remember: true,
        startedAt: new Date().toISOString(),
        token: `demo-session-${result.user.id}`,
      });
      return result;
    },
    [beginSession, openWorkspace],
  );

  /** Opens the verification link. Offline this flips a flag; served this is the endpoint. */
  const verifyEmail = useCallback(async () => {
    if (usingApi()) {
      try {
        await request('POST', '/auth/verify-email');
        return { ok: true };
      } catch (caught) {
        return { ok: false, error: describeError(caught) };
      }
    }
    // Read the session at call time, not from render state — the link can be opened
    // after the session changed, and an empty dep list must not hide a stale closure.
    const current = loadSession();
    if (!current?.userId) return { ok: false, error: 'No active session to verify.' };
    store.forceVerify(current.userId);
    setSession(loadSession());
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    if (usingApi()) {
      request('POST', '/auth/logout').catch(() => {});
      // The next visitor must not inherit this workspace from the cache.
      store.clearServedData();
    }
    saveSession(null);
    setSession(null);
    setStatus(usingApi() ? 'signedOut' : 'idle');
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userId: user?.id ?? null,
      role: user?.role ?? null,
      isRecruiter: actsAs(user?.role, 'recruiter'),
      isDeveloper: actsAs(user?.role, 'developer'),
      isAuthenticated: Boolean(user),
      isVerified: Boolean(user?.emailVerified),
      isLoading: status === 'pending',
      status,
      error,
      dataSource: usingApi() ? 'api' : 'local',
      apiBase: API_BASE,
      login,
      loginAsDemo,
      register,
      verifyEmail,
      logout,
      clearError: () => setError(null),
      demoAccounts: store.listDemoAccounts(),
    }),
    [user, status, error, login, loginAsDemo, register, verifyEmail, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
