import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context';
import { useProfile } from '../hooks/useStore';
import { matching } from '../services/api';
import { MATCH_WEIGHTS } from '../lib/matching';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { MatchMeter } from '../components/common/MatchMeter';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SkillList } from '../components/common/Tag';
import { formatSalary, timeAgo } from '../utils/format';

const BANDS = [
  { value: 'all', label: 'Every score' },
  { value: 'strong', label: 'Strong', min: 75 },
  { value: 'good', label: 'Good', min: 55 },
  { value: 'fair', label: 'Developing', min: 0 },
];

export function Matches() {
  const { user } = useAuth();
  const [band, setBand] = useState('all');
  const [open, setOpen] = useState(null);
  const [includeApplied, setIncludeApplied] = useState(false);

  const profile = useProfile(user);

  const ranked = useMemo(() => {
    if (!user) return [];
    const rows = matching.forUser(user.id, { sort: 'match' });
    return rows
      .filter((job) => includeApplied || !job.alreadyApplied)
      .filter((job) => {
        if (band === 'all') return true;
        const threshold = BANDS.find((b) => b.value === band)?.min ?? 0;
        return (job.match?.score ?? 0) >= threshold;
      });
  }, [user, band, includeApplied]);

  if (!user) return null;

  const skillsMissing = new Set();
  for (const job of ranked.slice(0, 10)) {
    for (const skill of job.match?.missingSkills ?? []) skillsMissing.add(skill);
  }

  return (
    <div>
      <PageHeader
        title="Job matches"
        eyebrow="Deterministic scoring"
        description={`Every published role scored against your ${user.skills?.length ?? 0} listed skills, your experience level and your work-mode preference. Same inputs, same numbers — refreshing cannot change a score.`}
        actions={
          <Button to="/profile/edit" variant="outline">
            Adjust what is scored
          </Button>
        }
      />

      <SectionCard
        title="How the score is built"
        description="A weighted overlap check, not a model. These are the exact weights."
        className="mb-4"
      >
        <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Required skills', MATCH_WEIGHTS.required, 'share of the required list you already claim'],
            ['Preferred skills', MATCH_WEIGHTS.preferred, 'share of the nice-to-have list you claim'],
            ['Experience level', MATCH_WEIGHTS.experience, 'full marks at the target level, less either side'],
            ['Work mode', MATCH_WEIGHTS.workMode, 'remote / hybrid / onsite against your preference'],
          ].map(([label, weight, note]) => (
            <li key={label} className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                {label}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
                {weight} pts
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">{note}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          ariaLabel="Filter by score band"
          size="sm"
          value={band}
          onChange={setBand}
          options={BANDS.map(({ value, label }) => ({
            value,
            label,
            count:
              value === 'all'
                ? ranked.length
                : ranked.filter((job) => (job.match?.band ?? 'fair') === (value === 'fair' ? 'fair' : value)).length,
          }))}
        />
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <input
            type="checkbox"
            checked={includeApplied}
            onChange={(event) => setIncludeApplied(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border-strong)] accent-[var(--color-accent)]"
          />
          Include roles I already applied to
        </label>
      </div>

      {profile.percent < 100 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" aria-hidden />
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Your profile is {profile.percent}% complete. Fields that are empty are scored as absent,
            so the numbers below are a floor rather than your real fit.
            {profile.missing.length > 0 && ` Still missing: ${profile.missing.join(', ')}.`}
          </p>
        </div>
      )}

      {ranked.length === 0 ? (
        <EmptyState
          icon="recommendations"
          title="Nothing in this band"
          description={
            includeApplied
              ? 'No published role scores into this band. Widen the band, or add skills your profile is short on.'
              : 'Every role in this band has already been applied to. Tick the box above to see them.'
          }
          action={
            <Button onClick={() => setBand('all')} size="sm" variant="outline">
              Show every score
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {ranked.map((job) => {
            const expanded = open === job.id;
            return (
              <li
                key={job.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div className="flex items-start gap-3 p-4">
                  <Avatar name={job.company?.name ?? job.title} size="lg" square />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] sm:text-base">
                          <Link to={`/jobs/${job.id}`} className="hover:text-[var(--color-accent)]">
                            {job.title}
                          </Link>
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                          {job.company?.name} · {job.location} · posted {timeAgo(job.postedAt)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                          <StatusBadge status={job.workMode} kind="workMode" />
                          <Badge>{job.experienceLevel}</Badge>
                          {job.salary && (
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {formatSalary(job.salary)}
                            </span>
                          )}
                          {job.alreadyApplied && <Badge tone="success">Applied</Badge>}
                        </div>
                      </div>
                      <MatchMeter match={job.match} className="w-32 shrink-0" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <SkillList
                        skills={job.requiredSkills}
                        matched={job.match?.matchedSkills}
                        missing={job.match?.missingSkills}
                        max={8}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Sparkles}
                          onClick={() => setOpen(expanded ? null : job.id)}
                          aria-expanded={expanded}
                        >
                          {expanded ? 'Hide the maths' : 'Why this score'}
                        </Button>
                        {job.hasApplied ? (
                          <Button to="/applications" size="sm" variant="outline">
                            Track it
                          </Button>
                        ) : (
                          <Button to={`/jobs/${job.id}/apply`} size="sm">
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                        <MatchMeter match={job.match} size="lg" showBars={false} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {skillsMissing.size > 0 && (
        <SectionCard
          title="The skills holding your scores down"
          description="Counted across the ten best matches. Adding evidence for these raises more than one score at a time."
          className="mt-4"
        >
          <SkillList skills={[...skillsMissing].sort().slice(0, 12)} />
        </SectionCard>
      )}
    </div>
  );
}

export default Matches;
