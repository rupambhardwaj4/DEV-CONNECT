import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Ban,
  Bookmark,
  BookmarkCheck,
  Check,
  ExternalLink,
  GitFork,
  Link2,
  MapPin,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context';
import { store, useStore } from '../hooks/useStore';
import { connections, developers, github, matching, recruiter } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Card, SectionCard } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Badge, ConnectionStateBadge, MatchBadge } from '../components/common/Badge';
import { SkillList } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { Menu } from '../components/common/Menu';
import { DetailList } from '../components/common/DetailList';
import { Timeline } from '../components/common/Timeline';
import { ContributionGrid } from '../components/common/ContributionGrid';
import { MatchMeter } from '../components/common/MatchMeter';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { formatNumber, pluralize } from '../utils/format';

const OPEN_TO_LABELS = {
  'new-roles': 'Open to new roles',
  'leadership-roles': 'Open to leadership',
  'contract-work': 'Open to contract work',
  'first-roles': 'Looking for first role',
  advisory: 'Open to advisory',
  'not-looking': 'Not looking',
};

function openToLabel(value) {
  return OPEN_TO_LABELS[value] ?? value ?? 'No preference set';
}

function openToTone(value) {
  if (value === 'not-looking') return 'neutral';
  if (value === 'advisory') return 'info';
  if (value === 'first-roles') return 'warning';
  return 'success';
}

export function DeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isRecruiter, isDeveloper } = useAuth();
  const snapshot = useStore();

  const [pending, setPending] = useState({});

  const data = useMemo(() => {
    const detail = developers.detail(id, user?.id);
    if (!detail) return null;
    const gh = github.profile(id);
    const repos = github.repositories(id);

    const incomingByUser = new Map(store.getPendingRequests(user?.id).map((r) => [r.fromUserId, r.id]));
    const outgoingByUser = new Map(store.getSentRequests(user?.id).map((r) => [r.toUserId, r.id]));

    const sharedSkills = isDeveloper
      ? (detail.skills ?? []).filter((s) =>
          (user?.skills ?? []).some((v) => v.toLowerCase() === s.toLowerCase()),
        )
      : [];

    const similar = isDeveloper && user ? matching.forUser(user.id, { sort: 'match' }).slice(0, 3) : [];

    let jobMatches = [];
    let isSaved = false;
    if (isRecruiter && user) {
      const liveJobs = recruiter.jobPostings(user.id).items.filter((j) => j.status === 'published');
      jobMatches = liveJobs
        .map((job) => ({ job, match: store.scoreMatchFor(detail, job.id) }))
        .filter((entry) => entry.match)
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3);
      isSaved = recruiter.savedCandidates(user.id).some((c) => c.id === detail.id);
    }

    return {
      detail,
      gh,
      repos,
      incomingByUser,
      outgoingByUser,
      sharedSkills,
      similar,
      jobMatches,
      isSaved,
    };
    // `snapshot` is a dependency so this memo recomputes after any store mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, isDeveloper, isRecruiter, snapshot]);

  if (!user) return null;

  if (!data) {
    return (
      <div>
        <PageHeader
          eyebrow="Developer profile"
          title="Profile not found"
          back={{ to: '/network', label: 'Back to network' }}
        />
        <Card>
          <EmptyState
            icon="users"
            title="We could not find that developer"
            description="This profile does not exist, is not a developer account, or may have been removed. Head back to Network to find someone to connect with."
            action={
              <Button to="/network" size="sm">
                Go to Network
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const { detail, gh, repos, sharedSkills, similar, jobMatches, isSaved } = data;
  const state = store.getConnectionState(user.id, detail.id);

  async function runAction(kind, fn, successMsg) {
    setPending((p) => ({ ...p, action: kind }));
    try {
      const result = await fn();
      if (result && result.ok === false) toast.error(result.error ?? 'That did not work.');
      else if (result && result.state === 'incoming' && result.error) toast.info(result.error);
      else if (successMsg) toast.success(successMsg);
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next.action;
        return next;
      });
    }
  }

  function connect() {
    return runAction(
      'send',
      () => connections.send(user.id, detail.id),
      `Request sent to ${detail.name}.`,
    );
  }

  function cancel() {
    const requestId = data.outgoingByUser.get(detail.id);
    if (!requestId) return null;
    return runAction(
      'withdraw',
      () => connections.withdrawSent(requestId),
      `Request to ${detail.name} withdrawn.`,
    );
  }

  function accept() {
    const requestId = data.incomingByUser.get(detail.id);
    if (!requestId) return null;
    return runAction(
      'respond',
      () => connections.respond(requestId, true),
      `You are connected with ${detail.name}.`,
    );
  }

  async function toggleSave() {
    setPending((p) => ({ ...p, save: true }));
    const result = await recruiter.toggleSaveCandidate(user.id, detail.id);
    setPending((p) => {
      const next = { ...p };
      delete next.save;
      return next;
    });
    if (result && result.ok === false) toast.error(result.error ?? 'Could not update the shortlist.');
    else toast.success(result?.saved ? `${detail.name} saved to your candidates.` : 'Removed from your candidates.');
  }

  async function copyLink() {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied to your clipboard.');
      } catch {
        toast.error(`Could not copy automatically. Copy this link manually: ${url}`);
      }
    } else {
      toast.warning(`Clipboard is unavailable in this browser. Copy manually: ${url}`);
    }
  }

  function connectionControl() {
    const busy = pending.action;
    if (state === 'self') {
      return (
        <Button to="/profile/edit" size="sm" variant="outline">
          Edit your profile
        </Button>
      );
    }
    if (state === 'connected') {
      return (
        <Button size="sm" variant="outline" disabled>
          Connected
        </Button>
      );
    }
    if (state === 'outgoing') {
      return (
        <Button
          size="sm"
          variant="outline"
          icon={Ban}
          loading={busy === 'withdraw'}
          disabled={Boolean(busy)}
          onClick={cancel}
        >
          Requested · Cancel
        </Button>
      );
    }
    if (state === 'incoming') {
      return (
        <Button
          size="sm"
          icon={Check}
          loading={busy === 'respond'}
          disabled={Boolean(busy)}
          onClick={accept}
        >
          Accept request
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        icon={UserPlus}
        loading={busy === 'send'}
        disabled={Boolean(busy)}
        onClick={connect}
      >
        Connect
      </Button>
    );
  }

  const experienceEntries = (detail.experience ?? []).map((exp, i) => ({
    label: exp.title,
    at: exp.startYear ? `${exp.startYear}-01-01T00:00:00.000Z` : undefined,
    detail: `${exp.organization} · ${exp.startYear}${exp.endYear ? `–${exp.endYear}` : '–present'}${
      exp.detail ? ` — ${exp.detail}` : ''
    }`,
    key: `exp-${i}`,
  }));

  const educationEntries = (detail.education ?? []).map((edu, i) => ({
    label: edu.title,
    at: edu.startYear ? `${edu.startYear}-01-01T00:00:00.000Z` : undefined,
    detail: `${edu.organization}${edu.endYear ? ` · ${edu.startYear}–${edu.endYear}` : ''}`,
    key: `edu-${i}`,
  }));

  const links = [
    { label: 'Website', value: detail.website, href: detail.website },
    {
      label: 'LinkedIn',
      value: detail.linkedIn,
      href: detail.linkedIn ? `https://www.linkedin.com/${detail.linkedIn}` : null,
    },
    { label: 'GitHub', value: detail.githubUsername, href: gh?.url },
  ].filter((l) => l.value && l.href);

  return (
    <div>
      <PageHeader
        eyebrow="Developer profile"
        title={detail.name}
        description={detail.headline}
        back={{ to: '/network', label: 'Back to network' }}
        actions={
          <>
            {connectionControl()}
            <Menu
              label={`Actions for ${detail.name}`}
              items={[
                { id: 'copy', label: 'Copy profile link', icon: Link2, onSelect: copyLink },
                { id: 'network', label: 'Back to Network', onSelect: () => navigate('/network') },
              ]}
            />
          </>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={detail.name} src={detail.avatar} size="2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {state !== 'self' && <ConnectionStateBadge state={state} />}
              <Badge tone="neutral">{detail.experienceLevel}</Badge>
              <Badge tone={openToTone(detail.openTo)}>{openToLabel(detail.openTo)}</Badge>
            </div>
            {detail.location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                <MapPin className="h-4 w-4 text-[var(--color-text-tertiary)]" aria-hidden />
                {detail.location}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
              <span>{pluralize(detail.yearsOfExperience ?? 0, 'year of experience')}</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden />
                {pluralize(detail.mutualConnections, 'mutual connection')}
              </span>
              {gh && (
                <a
                  href={gh.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--color-accent)]"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden />
                  {formatNumber(gh.totalStars)} stars across {gh.repositoryCount} repos
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {detail.bio && (
            <SectionCard title="About">
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{detail.bio}</p>
            </SectionCard>
          )}

          <SectionCard
            title="Skills"
            description={
              isDeveloper && sharedSkills.length
                ? `Skills you also list are highlighted — ${sharedSkills.length} in common.`
                : undefined
            }
          >
            <SkillList skills={detail.skills ?? []} matched={sharedSkills} max={0} emptyLabel="No skills listed yet." />
          </SectionCard>

          {experienceEntries.length > 0 && (
            <SectionCard title="Experience">
              <Timeline entries={experienceEntries} />
            </SectionCard>
          )}

          {educationEntries.length > 0 && (
            <SectionCard title="Education">
              <Timeline entries={educationEntries} />
            </SectionCard>
          )}

          <SectionCard
            title="Repositories"
            description={
              gh
                ? 'Contribution activity is shown from this developer\'s linked GitHub.'
                : undefined
            }
          >
            {gh?.contributions?.length > 0 && <ContributionGrid values={gh.contributions} className="mb-4" />}
            {repos.length === 0 ? (
              <EmptyState
                icon="projects"
                title="No repositories to show"
                description="This developer hasn't surfaced any public repositories yet."
                compact
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {repos.map((repo) => (
                  <li key={repo.id}>
                    <Card hover className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 truncate text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                        >
                          {repo.name}
                        </a>
                        <Badge tone="neutral">{repo.language}</Badge>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                        {repo.description}
                      </p>
                      <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-[var(--color-text-tertiary)]">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" aria-hidden /> {formatNumber(repo.stars)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5" aria-hidden /> {formatNumber(repo.forks)}
                        </span>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {detail.projects?.length > 0 && (
            <SectionCard title="Projects">
              <ul className="space-y-3">
                {detail.projects.map((project) => (
                  <li key={project.id}>
                    <Card className="h-full">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{project.title}</p>
                      {project.period && (
                        <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{project.period}</p>
                      )}
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {project.summary}
                      </p>
                      {project.tags?.length > 0 && (
                        <SkillList skills={project.tags} max={0} className="mt-3" />
                      )}
                      {(project.url || project.repoUrl) && (
                        <div className="mt-3 flex gap-3 text-xs">
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" aria-hidden /> Live
                            </a>
                          )}
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
                            >
                              <GitFork className="h-3 w-3" aria-hidden /> Source
                            </a>
                          )}
                        </div>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>

        <aside className="space-y-4">
          <SectionCard title="Profile completeness" description="Deterministic: filled required fields over all required fields.">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
                {detail.profileCompletion.percent}%
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">complete</span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-alt)]"
              role="progressbar"
              aria-valuenow={detail.profileCompletion.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completeness"
            >
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${detail.profileCompletion.percent}%` }}
              />
            </div>
            {detail.profileCompletion.missing.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Missing: {detail.profileCompletion.missing.join(', ')}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Every required field is filled — match scoring has the full picture.
              </p>
            )}
          </SectionCard>

          {links.length > 0 && (
            <SectionCard title="Links">
              <DetailList
                items={links.map((l) => ({
                  label: l.label,
                  value: (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
                    >
                      {l.value}
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  ),
                }))}
              />
            </SectionCard>
          )}

          {isDeveloper && (
            <SectionCard
              title="Roles you both fit"
              description="Live postings scored against your own profile."
              action={
                <Button to="/matches" variant="ghost" size="sm">
                  All matches
                </Button>
              }
            >
              {similar.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No postings clear a match right now for your profile.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--color-border)]">
                  {similar.map((job) => (
                    <li key={job.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                        >
                          {job.title}
                        </Link>
                        <p className="truncate text-xs text-[var(--color-text-secondary)]">
                          {job.company?.name ?? '—'} · {job.location}
                        </p>
                      </div>
                      <MatchBadge match={job.match} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}

          {isRecruiter && state !== 'self' && (
            <SectionCard
              title="Candidate fit"
              description="Scored against your published postings."
              action={
                <Button
                  size="sm"
                  variant={isSaved ? 'secondary' : 'outline'}
                  icon={isSaved ? BookmarkCheck : Bookmark}
                  loading={Boolean(pending.save)}
                  disabled={Boolean(pending.save)}
                  onClick={toggleSave}
                >
                  {isSaved ? 'Saved' : 'Save candidate'}
                </Button>
              }
            >
              {jobMatches.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  You have no published postings to score this candidate against yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {jobMatches.map(({ job, match }) => (
                    <li key={job.id}>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {job.title}
                      </Link>
                      <p className="mb-1.5 truncate text-xs text-[var(--color-text-tertiary)]">
                        {job.company?.name ?? '—'} · {job.experienceLevel}
                      </p>
                      <MatchMeter match={match} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}
        </aside>
      </div>
    </div>
  );
}

export default DeveloperProfile;
