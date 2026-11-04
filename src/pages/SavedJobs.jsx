import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CalendarClock } from 'lucide-react';
import { useAuth } from '../context';
import { store, useStoreValue } from '../hooks/useStore';
import { jobs as jobsApi } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { IconButton } from '../components/common/IconButton';
import { MatchMeter } from '../components/common/MatchMeter';
import { PageHeader } from '../components/common/PageHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SkillList } from '../components/common/Tag';
import { useToast } from '../components/common/Toast';
import { formatDay, formatSalary, timeAgo } from '../utils/format';

const ORDERS = [
  { value: 'saved', label: 'Recently saved' },
  { value: 'match', label: 'Best match' },
  { value: 'deadline', label: 'Closing soonest' },
];

export function SavedJobs() {
  const toast = useToast();
  const { user, isDeveloper } = useAuth();
  const [order, setOrder] = useState('saved');
  const [busy, setBusy] = useState(null);

  const ids = useStoreValue((s) => s.savedJobs[user?.id] ?? [], [user?.id]);

  const rows = useMemo(() => {
    if (!user) return [];
    const list = ids
      .map((jobId) => {
        const job = store.getJobDetail(jobId);
        if (!job) return null;
        return {
          ...job,
          match: isDeveloper ? store.scoreMatchFor(user.id, jobId) : null,
          applied: store.hasApplied(user.id, jobId),
        };
      })
      .filter(Boolean);

    if (order === 'match') return list.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
    if (order === 'deadline') {
      return list.sort(
        (a, b) => Date.parse(a.applyDeadline ?? '9999') - Date.parse(b.applyDeadline ?? '9999'),
      );
    }
    // Saved order is insertion order; newest first.
    return list.reverse();
  }, [ids, order, user, isDeveloper]);

  if (!user) return null;

  async function remove(job) {
    setBusy(job.id);
    await jobsApi.unsave(user.id, job.id);
    setBusy(null);
    toast.success(`Removed ${job.title} from your shortlist`);
  }

  const closed = rows.filter((job) => job.status !== 'published').length;

  return (
    <div>
      <PageHeader
        title="Saved jobs"
        description={
          rows.length
            ? `${rows.length} shortlisted ${rows.length === 1 ? 'role' : 'roles'}${closed ? `, ${closed} no longer accepting applications` : ''}.`
            : 'Bookmark a posting on the board and it waits here with its current match score.'
        }
        actions={
          <>
            <Button to="/jobs" variant="outline">
              Browse the board
            </Button>
            <Button to="/matches" variant="ghost">
              Matched for me
            </Button>
          </>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="jobs"
          title="Nothing shortlisted"
          description="Saved roles keep their match score up to date as you change your skills, so this list is worth building before you apply."
          action={
            <Button to="/jobs" size="sm">
              Find a role to save
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 overflow-x-auto pb-1">
            <SegmentedControl
              ariaLabel="Order saved jobs"
              size="sm"
              value={order}
              onChange={setOrder}
              options={ORDERS.map((option) => ({ ...option, count: rows.length }))}
            />
          </div>

          <ul className="space-y-3">
            {rows.map((job) => (
              <li
                key={job.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={job.company?.name ?? job.title} size="lg" square />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] sm:text-base">
                          <Link to={`/jobs/${job.id}`} className="hover:text-[var(--color-accent)]">
                            {job.title}
                          </Link>
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                          {job.company?.name} · {job.location}
                        </p>
                      </div>
                      <IconButton
                        icon={Bookmark}
                        variant="solid"
                        label={`Remove ${job.title} from saved jobs`}
                        onClick={() => remove(job)}
                        disabled={busy === job.id}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <StatusBadge status={job.status} kind="job" />
                      <StatusBadge status={job.workMode} kind="workMode" />
                      <Badge>{job.experienceLevel}</Badge>
                      {job.salary && (
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {formatSalary(job.salary)}
                        </span>
                      )}
                      {job.applyDeadline && (
                        <span className="inline-flex items-center gap-1 text-[var(--color-text-tertiary)]">
                          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                          {formatDay(job.applyDeadline)}
                        </span>
                      )}
                      <span className="text-[var(--color-text-tertiary)]">
                        saved {timeAgo(job.postedAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      <SkillList
                        skills={job.requiredSkills}
                        matched={job.match?.matchedSkills}
                        missing={job.match?.missingSkills}
                        max={6}
                      />
                      <div className="flex items-center gap-3">
                        {job.match && <MatchMeter match={job.match} className="w-28" />}
                        {job.applied ? (
                          <Button to="/applications" size="sm" variant="outline">
                            Applied — track it
                          </Button>
                        ) : job.status === 'published' ? (
                          <Button to={`/jobs/${job.id}/apply`} size="sm">
                            Apply
                          </Button>
                        ) : (
                          <Button to={`/jobs/${job.id}`} size="sm" variant="ghost">
                            Closed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default SavedJobs;
