import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  CheckCheck,
  Eye,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context';
import { useStoreValue, useNotificationCount } from '../hooks/useStore';
import { notifications as notificationsApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Select } from '../components/common/Select';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Badge } from '../components/common/Badge';
import { NoNotifications } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { timeAgo, formatDay } from '../utils/format';

const KIND_META = {
  'application-update': { icon: Briefcase, label: 'Application', tone: 'info' },
  'connection-request': { icon: UserPlus, label: 'Request', tone: 'accent' },
  'connection-accepted': { icon: Users, label: 'Connection', tone: 'success' },
  'recruiter-activity': { icon: Eye, label: 'Recruiter', tone: 'warning' },
  system: { icon: Settings, label: 'System', tone: 'neutral' },
};

const meta = (kind) => KIND_META[kind] ?? { icon: Bell, label: 'Update', tone: 'neutral' };

export function Notifications() {
  const toast = useToast();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [tab, setTab] = useState('all');
  const [kind, setKind] = useState('all');
  const [busy, setBusy] = useState(null);

  const all = useStoreValue(() => (userId ? notificationsApi.list(userId) : []), [userId]);
  const unreadCount = useNotificationCount(userId);

  const kindOptions = useMemo(() => {
    const present = [...new Set(all.map((n) => n.kind))];
    return [
      { value: 'all', label: 'All types' },
      ...present.map((value) => ({ value, label: meta(value).label })),
    ];
  }, [all]);

  const rows = useMemo(
    () => all.filter((n) => (tab === 'unread' ? !n.read : true) && (kind === 'all' ? true : n.kind === kind)),
    [all, tab, kind],
  );

  async function open(notification) {
    if (!notification.read) {
      setBusy(notification.id);
      await notificationsApi.markRead(notification.id, true);
      setBusy(null);
    }
    if (notification.href) navigate(notification.href);
  }

  async function toggleRead(notification) {
    setBusy(notification.id);
    await notificationsApi.markRead(notification.id, !notification.read);
    setBusy(null);
  }

  async function remove(notification) {
    setBusy(notification.id);
    await notificationsApi.remove(notification.id);
    setBusy(null);
    toast.success('Notification removed.');
  }

  async function markAllRead() {
    setBusy('all');
    await notificationsApi.markAllRead(userId);
    setBusy(null);
    toast.success('Marked everything as read.');
  }

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Application updates, interview scheduling and connection requests land here. Read items stay in the list so history is never lost."
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={markAllRead}
              loading={busy === 'all'}
            >
              Mark all read
            </Button>
          )
        }
      />

      <SectionCard
        padding="none"
        actions={
          <div className="flex items-center gap-2">
            <SegmentedControl
              ariaLabel="Filter by read state"
              size="sm"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: `Unread${unreadCount ? ` (${unreadCount})` : ''}` },
              ]}
            />
            {kindOptions.length > 1 && (
              <div className="w-40">
                <Select
                  aria-label="Filter by type"
                  options={kindOptions}
                  value={kind}
                  onChange={(event) => setKind(event.target.value)}
                />
              </div>
            )}
          </div>
        }
      >
        {all.length === 0 ? (
          <NoNotifications />
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {tab === 'unread' ? 'Nothing unread' : 'No notifications of this type'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
              {tab === 'unread'
                ? "You're all caught up. Read items stay under All."
                : 'Try a different type, or switch back to All.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {rows.map((notification) => {
              const Icon = meta(notification.kind).icon;
              const isBusy = busy === notification.id;
              return (
                <li
                  key={notification.id}
                  className={`flex gap-3 p-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-surface-alt)_60%,transparent)] ${
                    notification.read ? '' : 'border-l-2 border-l-[var(--color-accent)]'
                  }`}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)]"
                    aria-hidden
                  >
                    <Icon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => open(notification)}
                        className={`text-left text-sm hover:text-[var(--color-accent)] ${
                          notification.read
                            ? 'text-[var(--color-text-secondary)]'
                            : 'font-semibold text-[var(--color-text-primary)]'
                        }`}
                      >
                        {notification.title}
                      </button>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {notification.body}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                      <Badge variant="outline" size="sm">{meta(notification.kind).label}</Badge>
                      <span title={formatDay(notification.createdAt)}>{timeAgo(notification.createdAt)}</span>
                      {notification.href && (
                        <button
                          type="button"
                          onClick={() => open(notification)}
                          className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-1">
                    <IconButton
                      icon={CheckCheck}
                      size="sm"
                      label={notification.read ? 'Mark as unread' : 'Mark as read'}
                      onClick={() => toggleRead(notification)}
                      disabled={isBusy}
                    />
                    <IconButton
                      icon={Trash2}
                      size="sm"
                      variant="danger"
                      label="Delete notification"
                      onClick={() => remove(notification)}
                      disabled={isBusy}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

export default Notifications;
