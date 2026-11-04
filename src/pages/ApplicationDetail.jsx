import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context';
import { store } from '../hooks/useStore';
import { applications as applicationsApi } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DetailList } from '../components/common/DetailList';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { Timeline } from '../components/common/Timeline';
import { MatchMeter } from '../components/common/MatchMeter';
import { useToast } from '../components/common/Toast';
import { formatDay, formatSalary, timeAgo } from '../utils/format';

const WITHDRAWABLE_BLOCK = ['rejected', 'withdrawn'];

export function ApplicationDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { user, isDeveloper } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const application = store.getApplication(id);

  if (!application) {
    return (
      <SectionCard title="Application not found">
        <EmptyState
          icon="default"
          title="There is no application with that reference"
          description="It may have been removed or cleared from this device."
          action={
            <Button to="/applications" size="sm">
              Back to applications
            </Button>
          }
        />
      </SectionCard>
    );
  }

  const mine = isDeveloper && application.userId === user.id;
  const match = application.job ? store.scoreMatchFor(application.userId, application.job.id) : null;

  async function withdraw() {
    setPending(true);
    const result = await applicationsApi.withdraw(id, user.id);
    setPending(false);
    setConfirmOpen(false);
    if (result.ok) toast.success('Application withdrawn');
    else toast.error(result.error);
  }

  return (
    <div>
      <PageHeader
        back={{ to: '/applications', label: 'All applications' }}
        eyebrow={`Applied ${timeAgo(application.appliedAt)}`}
        title={application.job?.title ?? 'Posting removed'}
        description={application.company?.name ?? 'Unknown company'}
        actions={<StatusBadge status={application.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Timeline" description="Every stage change, with what the recruiter wrote.">
            <Timeline entries={application.timeline} />
            {application.interview?.scheduledFor && (
              <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-info)]/40 bg-[var(--color-info-light)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-info-dark)] dark:text-[var(--color-info)]">
                  Interview
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                  {formatDay(application.interview.scheduledFor, { withTime: true })}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {application.interview.note}
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Your note to the team">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {application.coverNote}
            </p>
            {application.resume && (
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                Attachment or link:{' '}
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  {application.resume}
                </a>
              </p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="The role">
            {application.job ? (
              <>
                <div className="flex items-start gap-3">
                  <Avatar name={application.company?.name ?? application.job.title} size="md" square />
                  <div className="min-w-0">
                    <Link
                      to={`/jobs/${application.job.id}`}
                      className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                    >
                      {application.job.title}
                    </Link>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {application.company?.name} · {application.job.location}
                    </p>
                  </div>
                </div>
                <DetailList
                  className="mt-4"
                  dense
                  items={[
                    { label: 'Work mode', value: application.job.workMode },
                    { label: 'Type', value: application.job.jobType },
                    { label: 'Experience', value: application.job.experienceLevel },
                    { label: 'Pay', value: application.job.salary ? formatSalary(application.job.salary) : 'Not published' },
                    { label: 'Posting status', value: application.job.status },
                  ]}
                />
              </>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">
                The recruiter deleted this posting, so the application survives without it.
              </p>
            )}
          </SectionCard>

          {match && (
            <SectionCard title="Match at time of applying" description="Recomputed from your current profile.">
              <MatchMeter match={match} size="lg" />
            </SectionCard>
          )}

          <SectionCard title="Contact">
            <div className="flex items-start gap-3">
              <Avatar name={application.recruiter?.name ?? 'Recruiter'} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {application.recruiter?.name ?? 'Not specified'}
                </p>
                <p className="truncate text-xs text-[var(--color-text-secondary)]">
                  {application.recruiter?.headline}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              There's no message thread on applications. Updates reach you through notifications when the recruiter
              changes the status.
            </p>
          </SectionCard>

          {mine && !WITHDRAWABLE_BLOCK.includes(application.status) && (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <Badge tone="neutral">Withdraw</Badge>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Withdrawing keeps the record and its timeline, and tells the recruiter. This can't be
                undone.
              </p>
              <Button variant="danger" size="sm" className="mt-3" onClick={() => setConfirmOpen(true)}>
                Withdraw application
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={withdraw}
        loading={pending}
        danger
        title="Withdraw this application?"
        confirmLabel="Withdraw application"
        description={
          application.job
            ? `${application.recruiter?.name ?? 'The recruiter'} will see that you withdrew from ${application.job.title}. Your timeline stays readable.`
            : 'The posting is already gone; withdrawing marks your copy as withdrawn.'
        }
      />
    </div>
  );
}

export default ApplicationDetail;
