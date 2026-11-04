import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { MatchMeter } from '../components/common/MatchMeter';
import { useAuth } from '../context';
import { store } from '../hooks/useStore';
import { applications as applicationsApi } from '../services/api';
import { formatDay, formatSalary, timeAgo } from '../utils/format';

const STAGES = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'under-review', label: 'Under review' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'closed', label: 'Closed' },
];

const CLOSED = ['rejected', 'withdrawn'];

export function MyApplications() {
  const { user } = useAuth();
  const [stage, setStage] = useState('all');

  const rows = useMemo(() => (user ? applicationsApi.forUser(user.id) : []), [user]);

  const counts = useMemo(
    () =>
      rows.reduce(
        (acc, application) => ({ ...acc, [application.status]: (acc[application.status] ?? 0) + 1 }),
        {},
      ),
    [rows],
  );

  const visible = rows.filter((application) => {
    if (stage === 'all') return true;
    if (stage === 'closed') return CLOSED.includes(application.status);
    return application.status === stage;
  });

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Your applications"
        description="Everything you have sent, newest first. Status changes the recruiter makes appear here and in your notifications."
        actions={
          <Button to="/jobs" variant="outline">
            Find more roles
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="jobs"
          title="No applications yet"
          description="When you apply through a job page the submission lands here with its full timeline."
          action={
            <Button to="/matches" size="sm">
              Open your matches
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 overflow-x-auto pb-1">
            <SegmentedControl
              ariaLabel="Filter applications by stage"
              size="sm"
              value={stage}
              onChange={setStage}
              options={STAGES.map((option) => ({
                ...option,
                count:
                  option.value === 'all'
                    ? rows.length
                    : option.value === 'closed'
                      ? CLOSED.reduce((sum, status) => sum + (counts[status] ?? 0), 0)
                      : (counts[option.value] ?? 0),
              }))}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="default"
              title={`Nothing at the ${STAGES.find((s) => s.value === stage)?.label.toLowerCase()} stage`}
              description="Switch stages above, or apply to another role to build the pipeline out."
              compact
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((application) => (
                <ApplicationRow key={application.id} application={application} userId={user.id} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationRow({ application, userId }) {
  const { job, company, developer } = application;
  const match = job ? store.scoreMatchFor(developer ?? userId, job.id) : null;
  const latest = application.timeline[application.timeline.length - 1];

  return (
    <li className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start gap-3">
        <Avatar name={company?.name ?? job?.title ?? 'Removed'} size="lg" square />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] sm:text-base">
                {job ? (
                  <Link to={`/jobs/${job.id}`} className="hover:text-[var(--color-accent)]">
                    {job.title}
                  </Link>
                ) : (
                  'This posting was removed'
                )}
              </h2>
              <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                {company?.name ?? 'Unknown company'}
                {job?.location ? ` · ${job.location}` : ''} · applied {timeAgo(application.appliedAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={application.status} />
              <Button to={`/applications/${application.id}`} size="sm" variant="ghost">
                Open
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)]">
            {job?.salary && <span className="font-medium text-[var(--color-text-primary)]">{formatSalary(job.salary)}</span>}
            {application.interview?.scheduledFor && (
              <span className="text-[var(--color-info)]">
                Interview {formatDay(application.interview.scheduledFor, { withTime: true })}
              </span>
            )}
            {latest?.note && <span className="line-clamp-1 flex-1">{latest.note}</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {match ? (
              <div className="flex items-center gap-3">
                <MatchMeter match={match} className="w-28" />
                <Badge tone={match.missingSkills.length ? 'warning' : 'success'}>
                  {match.missingSkills.length
                    ? `${match.missingSkills.length} skill${match.missingSkills.length === 1 ? '' : 's'} short`
                    : 'Full skill coverage'}
                </Badge>
              </div>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {job && !CLOSED.includes(application.status) && (
                <Button to={`/jobs/${job.id}`} size="sm" variant="ghost">
                  Role details
                </Button>
              )}
              <Button to={`/applications/${application.id}`} size="sm" variant="outline">
                Timeline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default MyApplications;
