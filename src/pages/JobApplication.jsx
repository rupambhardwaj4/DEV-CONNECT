import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context';
import { useJob } from '../hooks/useStore';
import { jobs as jobsApi } from '../services/api';
import { store } from '../hooks/useStore';
import { Button } from '../components/common/Button';
import { DetailList } from '../components/common/DetailList';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { TextAreaField, TextField } from '../components/common/Field';
import { MatchMeter } from '../components/common/MatchMeter';
import { formatSalary } from '../utils/format';

const MIN_NOTE = 40;

export function JobApplication() {
  const { id } = useParams();
  const { user, isDeveloper } = useAuth();
  const job = useJob(id);

  const draftNote = useMemo(() => buildDraft(user, job), [user, job]);
  const [coverNote, setCoverNote] = useState(draftNote);
  const [resume, setResume] = useState(user?.resume ?? '');
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(null);

  if (!job) {
    return (
      <SectionCard title="Nothing to apply to">
        <EmptyState
          icon="jobs"
          title="This posting is not in the dataset"
          description="Pick a role from the board and open it before starting an application."
          action={
            <Button to="/jobs" size="sm">
              Browse jobs
            </Button>
          }
        />
      </SectionCard>
    );
  }

  const alreadyApplied = isDeveloper && store.hasApplied(user.id, job.id);
  const match = isDeveloper ? store.scoreMatchFor(user.id, job.id) : null;
  const closed = job.status !== 'published';

  if (done) {
    return (
      <div>
        <PageHeader title={`Application sent to ${job.company?.name ?? 'the team'}`} />
        <SectionCard>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{job.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Your application is recorded as Applied. The recruiter has been notified, and the timeline
                and the timeline on your applications page starts from this moment.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button to={`/applications/${done.id}`} size="sm">
              Track this application
            </Button>
            <Button to="/matches" variant="outline" size="sm">
              See other matches
            </Button>
            <Button to="/jobs" variant="ghost" size="sm">
              Back to the board
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (coverNote.trim().length < MIN_NOTE) {
      setFieldError(`Write at least ${MIN_NOTE} characters — the hiring team reads this first.`);
      return;
    }
    setFieldError(null);
    setPending(true);
    setError(null);
    const result = await jobsApi.apply(user.id, job.id, {
      coverNote: coverNote.trim(),
      resume: resume.trim() || null,
    });
    setPending(false);
    if (result.ok) setDone(result.application);
    else setError(result.error);
  }

  return (
    <div>
      <PageHeader
        back={{ to: `/jobs/${job.id}`, label: 'Role details' }}
        title={`Apply — ${job.title}`}
        description={`${job.company?.name ?? 'DevConnect'} · ${job.location}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Note to the hiring team"
            description="Specific beats generic: name the part of this role you would work on and what you have already done that is close to it."
          >
            {!isDeveloper && (
              <p className="mb-4 text-sm text-[var(--color-error)]">
                Only developer accounts can apply. Switch to a developer account to use this flow.
              </p>
            )}
            {alreadyApplied && (
              <p className="mb-4 rounded-[var(--radius-control)] border border-[var(--color-info)]/40 bg-[var(--color-info-light)] px-3 py-2.5 text-sm text-[var(--color-info-dark)] dark:text-[var(--color-info)]">
                You already have an active application on this role. Open{' '}
                <Button to="/applications" variant="link" size="xs" className="inline">
                  your applications
                </Button>{' '}
                to follow it.
              </p>
            )}
            {closed && !alreadyApplied && (
              <p className="mb-4 text-sm text-[var(--color-warning)]">
                This posting is not accepting applications, so sending is disabled.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextAreaField
                label="Your note"
                required
                rows={8}
                value={coverNote}
                onChange={(event) => {
                  setCoverNote(event.target.value);
                  setFieldError(null);
                  setError(null);
                }}
                error={fieldError}
                hint={`${coverNote.trim().length} characters. The recruiter sees this alongside your profile.`}
                disabled={pending || alreadyApplied || closed || !isDeveloper}
              />

              <TextField
                label="Resume or portfolio link"
                hint="Optional. A URL is enough — nothing is uploaded or stored elsewhere."
                placeholder="https://"
                value={resume}
                onChange={(event) => setResume(event.target.value)}
                disabled={pending || alreadyApplied || closed || !isDeveloper}
              />

              {error && (
                <p role="alert" className="text-sm text-[var(--color-error)]">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={pending}
                  disabled={alreadyApplied || closed || !isDeveloper}
                >
                  Send application
                </Button>
                <Button to={`/jobs/${job.id}`} variant="outline" size="lg">
                  Cancel
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="What they will see">
            <DetailList
              items={[
                { label: 'Name', value: user?.name },
                { label: 'Headline', value: user?.headline },
                { label: 'Location', value: user?.location },
                { label: 'Experience', value: user?.experienceLevel },
                { label: 'Skills', value: (user?.skills ?? []).slice(0, 8).join(', ') },
              ]}
              dense
            />
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              This is your profile as it stands. Recruiter-facing fields come straight from it, so an
              incomplete profile is what gets reviewed.
            </p>
            <Button to="/profile/edit" variant="ghost" size="sm" className="mt-2">
              Edit profile
            </Button>
          </SectionCard>

          <SectionCard title="The role">
            <DetailList
              items={[
                { label: 'Company', value: job.company?.name },
                { label: 'Location', value: job.location },
                { label: 'Work mode', value: job.workMode },
                { label: 'Type', value: job.jobType },
                { label: 'Experience', value: job.experienceLevel },
                { label: 'Pay', value: job.salary ? formatSalary(job.salary) : 'Not published' },
              ]}
              dense
            />
          </SectionCard>

          {match && (
            <SectionCard title="Your match on this role" description="Deterministic, from skill and preference overlap.">
              <MatchMeter match={match} size="lg" />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

/** A starting point the applicant must edit — never a pre-filled wall of filler. */
function buildDraft(user, job) {
  if (!user || !job) return '';
  const overlap = (job.requiredSkills ?? []).filter((skill) =>
    (user.skills ?? []).some((own) => own.toLowerCase() === skill.toLowerCase()),
  );
  if (!overlap.length) {
    return `I want to work on ${job.title} at ${job.company?.name ?? 'your team'}. Replace this with the specific part of the role you would own and one example of work you have done near it.`;
  }
  return `My work with ${overlap.slice(0, 3).join(', ')} is the closest fit for ${job.title} at ${
    job.company?.name ?? 'your team'
  }. Replace the rest of this draft with what you actually built and what changed because of it.`;
}

export default JobApplication;
