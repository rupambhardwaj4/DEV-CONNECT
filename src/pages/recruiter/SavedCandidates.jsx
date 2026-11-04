import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Scale, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context';
import { useStoreValue, store } from '../../hooks/useStore';
import { recruiter } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { SectionCard, Card } from '../../components/common/Card';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { Avatar } from '../../components/common/Avatar';
import { MatchBadge } from '../../components/common/Badge';
import { SkillList } from '../../components/common/Tag';
import { Button } from '../../components/common/Button';
import { IconButton } from '../../components/common/IconButton';
import { DetailList } from '../../components/common/DetailList';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';

export function SavedCandidates() {
  const toast = useToast();
  const { userId, isRecruiter } = useAuth();
  const [view, setView] = useState('grid');
  const [removing, setRemoving] = useState(null);

  const candidates = useStoreValue(
    () => (userId ? recruiter.savedCandidates(userId) : []),
    [userId],
  );
  const published = useStoreValue(
    () => (userId ? recruiter.jobPostings(userId).items.filter((j) => j.status === 'published') : []),
    [userId],
  );

  const scored = useMemo(
    () =>
      candidates.map((candidate) => {
        let best = null;
        for (const job of published) {
          const match = store.scoreMatchFor(candidate.id, job.id);
          if (match && (!best || match.score > best.match.score)) best = { job, match };
        }
        return { candidate, best };
      }),
    [candidates, published],
  );

  if (!isRecruiter) {
    return (
      <div>
        <PageHeader eyebrow="Recruiter workspace" title="Saved candidates" description="Your shortlist of developers." />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Saved candidates are only available to recruiter accounts.
        </p>
      </div>
    );
  }

  async function remove(candidate) {
    setRemoving(candidate.id);
    await recruiter.toggleSaveCandidate(userId, candidate.id);
    setRemoving(null);
    toast.success(`Removed ${candidate.name} from your saved candidates.`);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Recruiter workspace"
        title="Saved candidates"
        description="Developers you shortlisted from the pipeline. Compare them on skills and how they score against your live roles."
        actions={
          candidates.length > 0 && (
            <SegmentedControl
              ariaLabel="Switch view"
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: 'grid', label: 'Cards', icon: LayoutGrid },
                { value: 'compare', label: 'Compare', icon: Scale },
              ]}
            />
          )
        }
      />

      {candidates.length === 0 ? (
        <SectionCard padding="none">
          <EmptyState
            icon="users"
            title="No saved candidates yet"
            description="Save an applicant from the pipeline to keep them here, then compare your shortlist side by side."
            action={
              <Button to="/recruiter/applicants" size="sm" icon={Users}>
                Go to applicants
              </Button>
            }
          />
        </SectionCard>
      ) : view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="flex flex-col gap-3 p-4" padding="none">
              <div className="flex items-start gap-3">
                <Avatar name={candidate.name} src={candidate.avatar} size="lg" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/developers/${candidate.id}`}
                    className="block truncate text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                  >
                    {candidate.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
                    {candidate.headline}
                  </p>
                </div>
                <IconButton
                  icon={Trash2}
                  label={`Remove ${candidate.name}`}
                  variant="danger"
                  onClick={() => remove(candidate)}
                  disabled={removing === candidate.id}
                />
              </div>
              <SkillList skills={candidate.skills ?? []} max={8} className="mt-auto" />
            </Card>
          ))}
        </div>
      ) : (
        <SectionCard
          padding="none"
          title="Side by side"
          description={`Best-matching live posting and skill coverage for each saved candidate. ${
            published.length === 0 ? 'You have no published roles to score against.' : ''
          }`}
        >
          <div className="flex snap-x gap-3 overflow-x-auto p-4">
            {scored.map(({ candidate, best }) => (
              <div
                key={candidate.id}
                className="w-72 shrink-0 snap-start rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={candidate.name} src={candidate.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/developers/${candidate.id}`}
                      className="block truncate text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                    >
                      {candidate.name}
                    </Link>
                    <p className="truncate text-xs text-[var(--color-text-tertiary)]">{candidate.location}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    Best match
                  </p>
                  {best ? (
                    <>
                      <Link
                        to={`/recruiter/applicants?job=${best.job.id}`}
                        className="mt-1 block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {best.job.title}
                      </Link>
                      <div className="mt-1.5">
                        <MatchBadge match={best.match} />
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      No published role to score against yet.
                    </p>
                  )}
                </div>

                <DetailList
                  className="mt-4"
                  dense
                  items={[
                    { label: 'Level', value: candidate.experienceLevel },
                    { label: 'Open to', value: candidate.openTo },
                  ]}
                />

                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    Skills
                  </p>
                  <SkillList
                    skills={candidate.skills ?? []}
                    matched={best?.match.matchedSkills ?? []}
                    max={14}
                    emptyLabel="No skills listed"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  icon={Trash2}
                  onClick={() => remove(candidate)}
                  disabled={removing === candidate.id}
                  loading={removing === candidate.id}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default SavedCandidates;
