import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bookmark,
  Building2,
  CalendarClock,
  CircleAlert,
  MapPin,
  Users,
} from 'lucide-react';
import { useAuth } from '../context';
import { useJob, store } from '../hooks/useStore';
import { jobs as jobsApi } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DetailList } from '../components/common/DetailList';
import { EmptyState } from '../components/common/EmptyState';
import { IconButton } from '../components/common/IconButton';
import { MatchMeter } from '../components/common/MatchMeter';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { SkillList } from '../components/common/Tag';
import { useToast } from '../components/common/Toast';
import { formatDay, formatSalary, timeAgo } from '../utils/format';

const readable = (value) => String(value ?? '').replace(/-/g, ' ');

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isDeveloper, isRecruiter } = useAuth();
  const job = useJob(id);
  const [saving, setSaving] = useState(false);

  const match = isDeveloper ? store.scoreMatchFor(user.id, id) : null;
  const saved = isDeveloper ? store.isJobSaved(user.id, id) : false;
  const applied = isDeveloper ? store.hasApplied(user.id, id) : false;

  if (!job) {
    return (
      <SectionCard title="Posting not found">
        <EmptyState
          icon="jobs"
          title="This posting is no longer in the dataset"
          description="The link may point at a role that was deleted, or at an id that never existed."
          action={
            <Button onClick={() => navigate('/jobs')} size="sm">
              Back to the board
            </Button>
          }
        />
      </SectionCard>
    );
  }

  const isOwner = isRecruiter && job.recruiterId === user.id;
  // The review account acts as both roles, so its own postings must not offer it the
  // developer call-to-action.
  const canApply = isDeveloper && !isOwner;

  async function toggleSave() {
    setSaving(true);
    if (saved) await jobsApi.unsave(user.id, job.id);
    else await jobsApi.save(user.id, job.id);
    setSaving(false);
    toast.success(saved ? 'Removed from saved jobs' : 'Saved — it is on your shortlist now');
  }

  return (
    <div>
      <PageHeader
        back={{ to: '/jobs', label: 'All roles' }}
        eyebrow={job.isFeatured ? 'Featured role' : null}
        title={job.title}
        description={`${job.company?.name ?? 'DevConnect'} · ${job.location}`}
        actions={
          isDeveloper ? (
            <>
              <IconButton
                icon={Bookmark}
                label={saved ? 'Remove from saved jobs' : 'Save this job'}
                variant={saved ? 'solid' : 'ghost'}
                onClick={toggleSave}
                disabled={saving}
              />
              {canApply &&
                (applied ? (
                  <Button to="/applications" variant="outline">
                    Track your application
                  </Button>
                ) : (
                  <Button to={`/jobs/${job.id}/apply`}>Apply now</Button>
                ))}
            </>
          ) : null
        }
      />

      {job.status !== 'published' && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-light)] p-3.5 text-sm text-[var(--color-warning-dark)] dark:text-[var(--color-warning)]">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            This posting is {readable(job.status)}. It is not accepting new applications, but the
            record stays readable for whoever already applied.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="About the role">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{job.description}</p>
            {job.responsibilities?.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-semibold text-[var(--color-text-primary)]">
                  What you would own
                </h3>
                <ul className="mt-2 space-y-2">
                  {job.responsibilities.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </SectionCard>

          <SectionCard title="Skills">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Required
            </h3>
            <SkillList
              skills={job.requiredSkills}
              matched={match?.matchedSkills}
              missing={match?.missingSkills}
              className="mt-2"
            />
            {job.preferredSkills?.length > 0 && (
              <>
                <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  Nice to have
                </h3>
                <SkillList skills={job.preferredSkills} className="mt-2" />
              </>
            )}
            {match && (
              <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                Highlighted skills are the ones your profile already claims. The score on the right
                is computed from these lists, not from a model.
              </p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          {match && (
            <SectionCard title="Your match">
              <MatchMeter match={match} size="lg" />
            </SectionCard>
          )}

          <SectionCard title="Role details">
            <DetailList
              items={[
                { label: 'Work mode', value: readable(job.workMode) },
                { label: 'Employment type', value: readable(job.jobType) },
                { label: 'Experience', value: readable(job.experienceLevel) },
                {
                  label: 'Compensation',
                  value: job.salary ? formatSalary(job.salary) : 'Not published',
                },
                { label: 'Posted', value: timeAgo(job.postedAt) },
                {
                  label: 'Applications close',
                  value: job.applyDeadline ? formatDay(job.applyDeadline) : 'No stated deadline',
                },
                { label: 'Applicants so far', value: String(job.applicantCount) },
              ]}
            />
          </SectionCard>

          <SectionCard title="Company">
            <div className="flex items-start gap-3">
              <Avatar name={job.company?.name ?? 'DevConnect'} size="lg" square />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {job.company?.name ?? 'DevConnect sample company'}
                </p>
                {job.company?.industry && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {job.company.industry}
                  </p>
                )}
                {job.company?.headcount && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    {job.company.headcount} people
                  </p>
                )}
              </div>
            </div>
            {job.company?.description && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {job.company.description}
              </p>
            )}
            {job.company?.location && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {job.company.location}
              </p>
            )}
          </SectionCard>

          <SectionCard title="Who is hiring">
            <div className="flex items-start gap-3">
              <Avatar name={job.recruiter?.name ?? 'Recruiter'} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {job.recruiter?.name ?? 'Not specified'}
                </p>
                <p className="truncate text-xs text-[var(--color-text-secondary)]">
                  {job.recruiter?.headline}
                </p>
              </div>
            </div>
            {job.recruiter && !isOwner && (
              <Button to={`/developers/${job.recruiter.id}`} variant="outline" size="sm" className="mt-3" fullWidth>
                View their profile
              </Button>
            )}
          </SectionCard>

          {isOwner && (
            <SectionCard title="Manage this posting" description="You posted this role.">
              <div className="flex flex-wrap gap-2">
                <Button to={`/recruiter/jobs/${job.id}/edit`} size="sm" icon={Building2}>
                  Edit posting
                </Button>
                <Button to={`/recruiter/applicants?job=${job.id}`} size="sm" variant="outline" icon={CalendarClock}>
                  {job.applicantCount} applicants
                </Button>
              </div>
            </SectionCard>
          )}

          {canApply && !applied && (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <StatusBadge status={job.status} kind="job" />
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Applying sends a short note to the hiring team. Your application stays private to you and the recruiter.
              </p>
              <Button to={`/jobs/${job.id}/apply`} className="mt-3" fullWidth>
                Apply to this role
              </Button>
              <Link
                to="/profile/edit"
                className="mt-2 block text-center text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
              >
                Your note is pre-filled from your profile
              </Link>
            </div>
          )}

          {!isDeveloper && !isRecruiter && (
            <Badge tone="neutral">Signed in with an unknown role</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
