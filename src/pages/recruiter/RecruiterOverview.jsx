import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  ClipboardList,
  Send,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context';
import { useStoreValue } from '../../hooks/useStore';
import { activity, applications as applicationsApi, recruiter } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { SectionCard } from '../../components/common/Card';
import { StatTile } from '../../components/common/StatTile';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/format';

const DAY = 86400000;
const STAGES = ['applied', 'under-review', 'interview', 'offer', 'rejected'];

export function RecruiterOverview() {
  const { user, userId, isRecruiter } = useAuth();

  const data = useStoreValue(
    () => {
      if (!userId) return null;
      const stats = recruiter.stats(userId);
      const pipeline = applicationsApi.forRecruiter(userId);
      const attention = pipeline
        .filter((a) => a.status === 'applied' && Date.now() - Date.parse(a.updatedAt) > 3 * DAY)
        .map((a) => ({
          ...a,
          waitingDays: Math.max(0, Math.floor((Date.now() - Date.parse(a.appliedAt)) / DAY)),
        }));
      const postings = recruiter
        .jobPostings(userId)
        .items.filter((job) => job.status === 'published');
      return {
        stats,
        pipeline,
        attention,
        postings,
        feed: activity.forUser(userId, 6),
      };
    },
    [userId],
  );

  const firstName = useMemo(() => user?.name.split(' ')[0] ?? '', [user]);

  if (!user) return null;

  if (!isRecruiter) {
    return (
      <div>
        <PageHeader
          eyebrow="Recruiter workspace"
          title="This area is for hiring accounts"
          description="The overview, postings and applicant pipeline are built for recruiter sign-ins."
        />
        <EmptyState
          icon="users"
          title="You are signed in as a developer"
          description="Open this workspace with a recruiter account."
          action={
            <Button to="/settings" size="sm">
              Switch account
            </Button>
          }
        />
      </div>
    );
  }

  const byStatus = data?.stats.byStatus ?? {};
  const hasAnything = data && (data.stats.postings > 0 || data.pipeline.length > 0);

  return (
    <div>
      <PageHeader
        eyebrow={`Signed in as ${user.role}`}
        title={`Hiring overview, ${firstName}`}
        description={user.headline}
        actions={
          <>
            <Button to="/recruiter/jobs" variant="outline" icon={ArrowRight} iconPosition="right">
              Manage postings
            </Button>
            <Button to="/recruiter/applicants" icon={ClipboardList}>
              Review applicants
            </Button>
          </>
        }
      />

      {!hasAnything ? (
        <SectionCard title="Get your first applicants">
          <EmptyState
            icon="jobs"
            title="No postings yet"
            description="Publish a role to start collecting applications. The pipeline, attention queue and activity feed fill in as candidates apply."
            action={
              <Button to="/recruiter/jobs/new" size="sm">
                Post a job
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Postings"
              value={data.stats.postings}
              hint={`${data.stats.drafts} draft · ${data.stats.closed} closed`}
              icon={Briefcase}
            />
            <StatTile
              label="Published"
              value={data.stats.published}
              hint="Live and accepting applicants"
              icon={Send}
            />
            <StatTile
              label="Applicants"
              value={data.stats.applicants}
              hint="Across all your postings"
              icon={Users}
            />
            <StatTile
              label="In interview"
              value={data.stats.interviewStage}
              hint={
                data.stats.offersOut
                  ? `${data.stats.offersOut} offer${data.stats.offersOut === 1 ? '' : 's'} out`
                  : 'No offers sent yet'
              }
              icon={CalendarClock}
            />
          </div>

          <SectionCard
            className="mt-4"
            title="Pipeline"
            description="Every application you own, grouped by stage. Open a stage to work that list."
          >
            <div className="flex flex-wrap gap-2">
              {STAGES.map((stage) => (
                <Link
                  key={stage}
                  to={`/recruiter/applicants?status=${stage}`}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)]"
                >
                  <StatusBadge status={stage} />
                  <span className="tabular-nums font-medium text-[var(--color-text-primary)]">
                    {byStatus[stage] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="Needs your attention"
                description="Applied more than three days ago and still untouched."
                action={
                  data.attention.length > 0 && (
                    <Button to="/recruiter/applicants?status=applied" variant="ghost" size="sm">
                      Review all
                    </Button>
                  )
                }
              >
                {data.attention.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Nothing is sitting unreviewed right now. New applications show up here after
                    three days without a decision.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {data.attention.slice(0, 6).map((application) => {
                      const waitingDays = application.waitingDays;
                      return (
                        <li key={application.id} className="flex items-start gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/developers/${application.developer?.id}`}
                              className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                            >
                              {application.developer?.name ?? 'Applicant'}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                              Applied to {application.job?.title ?? 'a closed posting'} ·{' '}
                              {waitingDays} day{waitingDays === 1 ? '' : 's'} in queue
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                title="Your live postings"
                description="Published roles and how many people have applied."
                action={
                  <Button to="/recruiter/jobs" variant="ghost" size="sm">
                    All postings
                  </Button>
                }
              >
                {data.postings.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    You have no published roles. Draft one on{' '}
                    <Link
                      to="/recruiter/jobs"
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      Postings
                    </Link>{' '}
                    and publish it to open the pipeline.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {data.postings.map((job) => (
                      <li key={job.id} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/recruiter/jobs/${job.id}/edit`}
                            className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                          >
                            {job.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                            {job.location} · posted {timeAgo(job.postedAt)}
                          </p>
                        </div>
                        <Button to={`/recruiter/applicants?job=${job.id}`} variant="outline" size="sm">
                          {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>

            <SectionCard title="Recent activity">
              {data.feed.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No recorded activity yet. Applications and status changes land here.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {data.feed.map((entry) => (
                    <li key={entry.id} className="flex gap-2.5 text-sm">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
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
        </>
      )}
    </div>
  );
}

export default RecruiterOverview;
