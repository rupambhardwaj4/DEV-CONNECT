import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Bookmark,
  CalendarClock,
  Check,
  ClipboardList,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../context';
import { useProfile, useStoreValue, store } from '../hooks/useStore';
import {
  activity,
  applications as applicationsApi,
  connections,
  matching,
  notifications as notificationsApi,
} from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { StatTile } from '../components/common/StatTile';
import { MatchMeter } from '../components/common/MatchMeter';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { EmptyState } from '../components/common/EmptyState';
import { formatDay, timeAgo } from '../utils/format';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busyRequest, setBusyRequest] = useState(null);

  const profile = useProfile(user);

  const data = useStoreValue(() => {
    if (!user) return null;
    const myApplications = applicationsApi.forUser(user.id);
    const active = myApplications.filter((a) => !['rejected', 'withdrawn'].includes(a.status));
    const interviews = myApplications.filter((a) => a.status === 'interview' && a.interview?.scheduledFor);
    const topMatches = matching.forUser(user.id, { sort: 'match', perPage: 4 }).slice(0, 4);
    return {
      myApplications,
      active,
      interviews,
      topMatches,
      saved: store.getSavedJobIds(user.id),
      requests: connections.pending(user.id),
      unread: notificationsApi.list(user.id).filter((n) => !n.read).slice(0, 4),
      feed: activity.forUser(user.id, 5),
    };
  }, [user]);

  if (!user || !data) return null;

  const firstName = user.name.split(' ')[0];

  async function respond(requestId, accept) {
    setBusyRequest(requestId);
    await connections.respond(requestId, accept);
    setBusyRequest(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Signed in as ${user.role}`}
        title={`Welcome back, ${firstName}`}
        description={user.headline}
        actions={
          <>
            <Button to="/jobs" variant="outline" icon={ArrowRight} iconPosition="right">
              Browse jobs
            </Button>
            <Button to="/matches" icon={Sparkles}>
              See my matches
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Active applications"
          value={data.active.length}
          hint={`${data.myApplications.length} total submitted`}
          icon={ClipboardList}
        />
        <StatTile
          label="Interviews"
          value={data.interviews.length}
          hint={
            data.interviews[0]?.interview?.scheduledFor
              ? `Next ${formatDay(data.interviews[0].interview.scheduledFor, { withTime: true })}`
              : 'None scheduled'
          }
          icon={CalendarClock}
        />
        <StatTile
          label="Saved jobs"
          value={data.saved.length}
          hint={data.saved.length ? 'Ready to apply' : 'Bookmark to shortlist'}
          icon={Bookmark}
        />
        <StatTile
          label="Strong matches"
          value={data.topMatches.filter((job) => job.match?.score >= 75).length}
          hint="Scored from your profile skills"
          icon={Sparkles}
        />
      </div>

      {profile.percent < 100 && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Profile is {profile.percent}% complete
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                Missing: {profile.missing.join(', ')}. Match scoring reads these fields, so an
                incomplete profile scores lower than your skills warrant.
              </p>
            </div>
            <Button to="/profile/edit" size="sm">
              Finish profile
            </Button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${profile.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Your applications"
            description="Newest first, with the last thing that happened."
            action={
              data.myApplications.length > 0 && (
                <Button to="/applications" variant="ghost" size="sm">
                  View all
                </Button>
              )
            }
          >
            {data.myApplications.length === 0 ? (
              <EmptyState
                icon="jobs"
                title="You have not applied to anything yet"
                description="Matches are scored from your skills and preferences. Open one and send an application to see this list fill up."
                action={
                  <Button to="/jobs" size="sm">
                    Find a role
                  </Button>
                }
                compact
              />
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {data.myApplications.slice(0, 4).map((application) => (
                  <li key={application.id}>
                    <Link
                      to={`/applications/${application.id}`}
                      className="flex items-start gap-3 py-3 transition-colors hover:bg-[var(--color-surface-alt)] -mx-3 px-3 rounded-[var(--radius-control)]"
                    >
                      <Avatar name={application.company?.name ?? 'DevConnect'} size="md" square />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                          {application.job?.title ?? 'Removed posting'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                          {application.company?.name} · applied {timeAgo(application.appliedAt)}
                        </p>
                        {application.timeline.length > 1 && (
                          <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                            {lastNote(application)}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={application.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Best matches right now"
            description="Deterministic scores from required skills, preferred skills, level and work mode."
            action={
              <Button to="/matches" variant="ghost" size="sm">
                All matches
              </Button>
            }
          >
            {data.topMatches.length === 0 ? (
              <EmptyState
                icon="search"
                title="No scored jobs yet"
                description="Add at least three skills to your profile and matches will start ranking the live postings."
                action={
                  <Button to="/profile/edit" size="sm">
                    Add skills
                  </Button>
                }
                compact
              />
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {data.topMatches.map((job) => (
                  <li key={job.id} className="flex items-start gap-3 py-3">
                    <Avatar name={job.company?.name ?? job.title} size="md" square />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                        {job.company?.name} · {job.location} · {job.experienceLevel}
                      </p>
                      <MatchMeter match={job.match} className="mt-2 max-w-[16rem]" />
                    </div>
                    <div className="hidden shrink-0 gap-1 sm:flex">
                      {job.match.missingSkills.slice(0, 2).map((skill) => (
                        <Badge key={skill} tone="warning">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Connection requests"
            action={
              <Button to="/network" variant="ghost" size="sm">
                Network
              </Button>
            }
          >
            {data.requests.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No pending requests. Discover people through{' '}
                <Link to="/network" className="text-[var(--color-accent)] hover:underline">
                  Network
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-3">
                {data.requests.slice(0, 3).map((request) => (
                  <li key={request.id} className="flex items-start gap-3">
                    <Avatar name={request.user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/developers/${request.user.id}`}
                        className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {request.user.name}
                      </Link>
                      <p className="truncate text-xs text-[var(--color-text-secondary)]">
                        {request.user.headline}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {timeAgo(request.requestedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <IconButton
                        icon={Check}
                        label={`Accept ${request.user.name}`}
                        onClick={() => respond(request.id, true)}
                        disabled={busyRequest === request.id}
                      />
                      <IconButton
                        icon={X}
                        label={`Decline ${request.user.name}`}
                        onClick={() => respond(request.id, false)}
                        disabled={busyRequest === request.id}
                      />
                    </div>
                  </li>
                ))}
                {data.requests.length > 3 && (
                  <li>
                    <Button to="/network" variant="ghost" size="sm" icon={UserPlus}>
                      {data.requests.length - 3} more
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Unread notifications"
            action={
              <Button to="/notifications" variant="ghost" size="sm" icon={Bell}>
                Open
              </Button>
            }
          >
            {data.unread.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Nothing unread. Activity on your applications and requests lands here.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.unread.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className="w-full text-left"
                    >
                      <p className="text-sm font-medium leading-snug text-[var(--color-text-primary)]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
                        {item.body}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {timeAgo(item.createdAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent profile activity">
            {data.feed.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Your profile has no recorded activity yet.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {data.feed.map((entry) => (
                  <li key={entry.id} className="flex gap-2.5 text-sm">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="text-[var(--color-text-primary)]">{entry.text}</span>{' '}
                      <span className="block text-xs text-[var(--color-text-tertiary)]">
                        {timeAgo(entry.at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function lastNote(application) {
  const previous = application.timeline[application.timeline.length - 2];
  const latest = application.timeline[application.timeline.length - 1];
  return latest?.note || previous?.note
    ? `${store.statusLabel(latest.status)}: ${latest.note ?? previous.note}`
    : `Moved to ${store.statusLabel(latest?.status ?? application.status)}`;
}

export default Dashboard;
