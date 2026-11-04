import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  HardDrive,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth, useTheme } from '../context';
import { useStoreValue, store } from '../hooks/useStore';
import { developers, demo } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import { Select } from '../components/common/Select';
import { FormRow } from '../components/common/Field';
import { DetailList } from '../components/common/DetailList';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';

const NOTIFICATION_ROWS = [
  { key: 'connectionRequests', label: 'Connection requests', description: 'When someone asks to connect or accepts your request.' },
  { key: 'applicationUpdates', label: 'Application updates', description: 'Status changes on roles you applied to — review, interview, offer.' },
  { key: 'jobMatches', label: 'New job matches', description: 'When a posting clears your match threshold.' },
  { key: 'recruiterActivity', label: 'Recruiter activity', description: 'When a recruiter views your profile or updates your application.' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const samePrefs = (a, b) =>
  NOTIFICATION_ROWS.every((row) => Boolean(a?.[row.key]) === Boolean(b?.[row.key]));

export function Settings() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, userId, isDeveloper, dataSource, apiBase } = useAuth();
  const { theme, setTheme, reduceMotion, setReduceMotion } = useTheme();

  const saved = useStoreValue(() => store.getUser(userId), [userId]);

  const [prefs, setPrefs] = useState(() => saved?.notificationPrefs ?? {});
  const [visibility, setVisibility] = useState(saved?.visibility ?? 'public');
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const prefsDirty =
    !samePrefs(prefs, saved?.notificationPrefs) ||
    (isDeveloper && visibility !== (saved?.visibility ?? 'public'));

  const diagnostics = useStoreValue(() => demo.diagnostics(), []);

  const accounts = useMemo(
    () => demo.accounts().map((account) => ({ ...account, me: account.userId === userId })),
    [userId],
  );

  async function savePreferences() {
    setSaving(true);
    const result = await developers.update(userId, {
      notificationPrefs: { ...prefs },
      ...(isDeveloper ? { visibility } : {}),
    });
    setSaving(false);
    if (!result?.ok) {
      toast.error(result?.error ?? 'Could not save your preferences. Try again.');
      return;
    }
    toast.success('Preferences saved. They persist across refreshes.');
  }

  async function resetDemo() {
    setResetting(true);
    const result = await demo.reset();
    setResetting(false);
    if (!result?.ok) {
      toast.error(result?.error ?? 'Could not reset the workspace. Try again.');
      return;
    }
    setResetOpen(false);
    toast.success('Workspace restored to its original content.');
    navigate('/', { replace: true });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile visibility, appearance, notifications and stored data."
      />

      <SectionCard title="Account" padding="none" className="mb-4">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <Avatar name={user?.name} src={user?.avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{user?.name}</p>
            <p className="truncate text-sm text-[var(--color-text-secondary)]">{user?.email}</p>
          </div>
          <Badge variant={isDeveloper ? 'accent' : 'info'}>{user?.role}</Badge>
          {isDeveloper && (
            <Button to="/profile/edit" size="sm" variant="outline">
              Edit profile
            </Button>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Appearance"
        description="Theme and motion. Applied instantly and remembered on this device."
        className="mb-4"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
              <Palette className="h-4 w-4 text-[var(--color-text-tertiary)]" aria-hidden />
              Theme
            </p>
            <div className="inline-grid grid-cols-3 gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTheme(option.value)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Toggle
            checked={reduceMotion}
            onChange={setReduceMotion}
            label="Reduce motion"
            description="Turns off transitions and animated feedback across the app."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Notifications"
        description="Choose what reaches you. These control what shows up in your notification centre."
        padding="none"
        className="mb-4"
        footer={
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {prefsDirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <div className="flex items-center gap-2">
              {prefsDirty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPrefs(saved?.notificationPrefs ?? {});
                    setVisibility(saved?.visibility ?? 'public');
                  }}
                  disabled={saving}
                >
                  Discard
                </Button>
              )}
              <Button size="sm" onClick={savePreferences} disabled={!prefsDirty} loading={saving}>
                Save changes
              </Button>
            </div>
          </div>
        }
      >
        <div className="px-4">
          {NOTIFICATION_ROWS.map((row) => (
            <FormRow
              key={row.key}
              label={row.label}
              description={row.description}
              control={
                <Toggle
                  checked={Boolean(prefs[row.key])}
                  onChange={(next) => setPrefs((prev) => ({ ...prev, [row.key]: next }))}
                />
              }
            />
          ))}
          {isDeveloper && (
            <FormRow
              label="Profile visibility"
              description="Private hides your profile from recruiter search and the developer directory."
              control={
                <div className="w-44">
                  <Select
                    aria-label="Profile visibility"
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value)}
                    options={[
                      { value: 'public', label: 'Public' },
                      { value: 'private', label: 'Private' },
                    ]}
                  />
                </div>
              }
            />
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Data & storage"
        description={
          dataSource === 'api'
            ? 'Your workspace lives in the server database; this device only caches what you are looking at. Resetting discards that cache and re-reads the server — anything you created here stays.'
            : "Your workspace is stored on this device. Resetting restores the original content and clears anything you've created; your session and theme are kept."
        }
        padding="none"
      >
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
              <HardDrive className="h-4 w-4 text-[var(--color-text-tertiary)]" aria-hidden />
              Storage status
            </p>
            <DetailList
              dense
              items={[
                { label: 'Source of truth', value: dataSource === 'api' ? `API — ${apiBase}` : 'This device' },
                { label: 'Persistence', value: diagnostics.available ? 'Available' : 'Unavailable (session-only)' },
                { label: 'Writes this session', value: diagnostics.revision },
                { label: 'Users', value: diagnostics.counts.users },
                { label: 'Jobs', value: diagnostics.counts.jobs },
                { label: 'Applications', value: diagnostics.counts.applications },
                { label: 'Notifications', value: diagnostics.counts.notifications },
              ]}
            />
            {diagnostics.problem && (
              <p className="mt-3 text-xs leading-relaxed text-[var(--color-warning)]">
                Storage isn't writable on this device right now, so changes last only until you close the tab.
              </p>
            )}
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
              <UserIcon className="h-4 w-4 text-[var(--color-text-tertiary)]" aria-hidden />
              Sample accounts
            </p>
            <ul className="space-y-2">
              {accounts.map((account) => (
                <li key={account.email} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-[var(--color-text-secondary)]">{account.email}</span>
                  {account.me ? (
                    <Badge variant="success" size="sm">Signed in</Badge>
                  ) : (
                    <Badge variant="outline" size="sm">{account.label}</Badge>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              Use these accounts to explore a populated workspace from the sign-in page.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" aria-hidden />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {dataSource === 'api' ? 'Reload from the server' : 'Reset workspace'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                {dataSource === 'api'
                  ? 'Drops the cached copy on this device and reads the database again. Records you created through the API are not affected.'
                  : "Clears everything you created — postings, applications, connections and saved items — and restores the original content. If you registered your own account, you'll be signed out."}
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" icon={RefreshCw} onClick={() => setResetOpen(true)}>
            {dataSource === 'api' ? 'Reload workspace' : 'Reset workspace'}
          </Button>
        </div>
      </SectionCard>

      <ConfirmDialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetDemo}
        loading={resetting}
        danger
        title={dataSource === 'api' ? 'Reload the cached workspace?' : 'Reset your workspace?'}
        confirmLabel={dataSource === 'api' ? 'Reload' : 'Reset everything'}
        description={
          dataSource === 'api'
            ? "This throws away the copy cached on this device and reads the server's data again. Records you created through the API come back on the next read."
            : "This restores the original content and clears everything you've created on this device. It cannot be undone."
        }
      >
        <p className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
          <Bell className="h-3.5 w-3.5" aria-hidden />
          Your theme and motion preferences are kept.
        </p>
      </ConfirmDialog>
    </div>
  );
}

export default Settings;
