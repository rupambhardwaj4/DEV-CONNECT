import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  GitBranch,
  GitFork,
  GraduationCap,
  MapPin,
  Pencil,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../context';
import { useProfile, useStoreValue, store } from '../hooks/useStore';
import { github, matching, projects as projectsApi } from '../services/api';
import { MATCH_WEIGHTS } from '../lib/matching';
import { actsAs } from '../lib/roles.js';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard, EmptyRow } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { SkillList } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { Tabs, TabPanels, useTabs } from '../components/common/Tabs';
import { DetailList } from '../components/common/DetailList';
import { ProgressBar } from '../components/common/ProgressBar';
import { MatchMeter } from '../components/common/MatchMeter';
import { EmptyState } from '../components/common/EmptyState';
import { formatNumber, pluralize, timeAgo } from '../utils/format';

const TAB_IDS = ['about', 'skills', 'experience', 'education', 'projects', 'repositories', 'preferences'];

const OPEN_TO_LABEL = {
  'new-roles': 'Open to new roles',
  'first-roles': 'Looking for a first role',
  'leadership-roles': 'Open to leadership roles',
  'contract-work': 'Open to contract work',
  advisory: 'Open to advisory work',
  collaboration: 'Open to collaboration',
  'not-looking': 'Not looking right now',
};

const VISIBILITY_COPY = {
  public: {
    label: 'Public',
    body: 'This is the broadest setting: the profile is written to be found in developer search and opened by link.',
  },
  connections: {
    label: 'Connections only',
    body: 'Intended for people you have already connected with. Only you can open it today — see the note below.',
  },
  private: {
    label: 'Private',
    body: 'Intended to hide the profile from discovery. Only you can open it today — see the note below.',
  },
};

export function Profile() {
  const { user, isDeveloper } = useAuth();
  const completion = useProfile(user);
  const { activeTab, setActiveTab } = useTabs(TAB_IDS);

  // useStoreValue, not useMemo([user]): a repository pin or a project edit changes the
  // snapshot without changing the user object's identity, and this page previews both.
  const data = useStoreValue(() => {
    if (!user) return null;
    const skills = user.skills ?? [];
    const experience = user.experience ?? [];
    const education = user.education ?? [];
    const repos = github.repositories(user.id);
    const myProjects = [...projectsApi.forUser(user.id)].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
    const topMatch =
      isDeveloper
        ? (matching.forUser(user.id, { sort: 'match', perPage: 3 }) ?? [])[0] ?? null
        : null;
    return {
      skills,
      experience,
      education,
      repos,
      myProjects,
      topMatch,
      githubConnected: github.isConnected(user.id),
    };
  }, [user, isDeveloper]);

  if (!user || !data) return null;

  const preferences = user.preferences ?? { workMode: 'any', roleTypes: [], locations: [] };
  const visibility = VISIBILITY_COPY[user.visibility] ?? VISIBILITY_COPY.public;

  const tabs = [
    {
      id: 'about',
      label: 'About',
      panel: (
        <SectionCard
          title="Professional summary"
          description="The paragraph a recruiter reads before they look at your skills."
          action={<EditAction />}
        >
          {user.bio ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {user.bio}
            </p>
          ) : (
            <EmptyState
              compact
              icon="default"
              title="No summary yet"
              description="Two or three sentences about what you build and where you have built it is enough to start."
              action={
                <Button to="/profile/edit" size="sm" icon={Pencil}>
                  Write a summary
                </Button>
              }
            />
          )}
        </SectionCard>
      ),
    },
    {
      id: 'skills',
      label: 'Skills',
      count: data.skills.length,
      panel: (
        <SectionCard
          title="Skills"
          description="Spelling is folded onto one canonical vocabulary, so 'reactjs' and 'React' count as the same skill."
          action={<EditAction />}
        >
          {data.skills.length === 0 ? (
            <EmptyState
              compact
              icon="search"
              title="No skills listed"
              description="Match scoring starts from this list. With nothing here there is nothing to compare against a posting's required skills."
              action={
                <Button to="/profile/edit" size="sm">
                  Add skills
                </Button>
              }
            />
          ) : (
            <>
              <SkillList skills={data.skills} max={null} />
              <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                {data.skills.length} listed. The matcher needs your list to cover a posting's
                required skills — {MATCH_WEIGHTS.required} of the {totalWeight()} available points come
                from that coverage alone.
              </p>
            </>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'experience',
      label: 'Experience',
      count: data.experience.length,
      panel: (
        <SectionCard
          title="Experience"
          description="Most recent first. One sentence on what you owned beats a list of duties."
          action={<EditAction />}
        >
          {data.experience.length === 0 ? (
            <EmptyRow icon={Briefcase}>
              No roles listed yet.
              <Button to="/profile/edit" size="sm" className="mt-2">
                Add a role
              </Button>
            </EmptyRow>
          ) : (
            <ol className="space-y-4">
              {data.experience.map((entry, index) => (
                <li key={`${entry.title}-${entry.organization}-${index}`} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {entry.title || 'Untitled role'}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {entry.organization || 'Organisation not listed'} ·{' '}
                      {periodLabel(entry.startYear, entry.endYear)}
                    </p>
                    {entry.detail && (
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {entry.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'education',
      label: 'Education',
      count: data.education.length,
      panel: (
        <SectionCard title="Education" action={<EditAction />}>
          {data.education.length === 0 ? (
            <EmptyRow icon={GraduationCap}>
              No education entries. Add a degree, a bootcamp, or the course you actually learned
              from.
              <Button to="/profile/edit" size="sm" className="mt-2">
                Add education
              </Button>
            </EmptyRow>
          ) : (
            <ul className="space-y-3.5">
              {data.education.map((entry, index) => (
                <li key={`${entry.title}-${entry.organization}-${index}`} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-border-strong)]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {entry.title || 'Untitled qualification'}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {entry.organization || 'Institution not listed'} ·{' '}
                      {periodLabel(entry.startYear, entry.endYear)}
                    </p>
                    {entry.detail && (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {entry.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      count: data.myProjects.length,
      panel: (
        <SectionCard
          title="Projects"
          description="Hand-authored by you — these are not the GitHub repositories above."
          action={
            <Button to="/repositories" variant="ghost" size="sm">
              Manage projects
            </Button>
          }
        >
          {data.myProjects.length === 0 ? (
            <EmptyState
              compact
              icon="projects"
              title="No projects added"
              description="Recruiters open this section. One project with a link and a paragraph on your role is enough to start."
              action={
                <Button to="/repositories?project=new" size="sm">
                  Add a project
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {data.myProjects.map((project) => (
                <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {project.title}
                    </p>
                    {project.featured && <Badge tone="accent">Featured</Badge>}
                    {project.period && (
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {project.period}
                      </span>
                    )}
                  </div>
                  {project.summary && (
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {project.summary}
                    </p>
                  )}
                  {project.tags?.length > 0 && (
                    <SkillList className="mt-2" skills={project.tags} max={8} />
                  )}
                  {(project.url || project.repoUrl) && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {project.url && (
                        <ExternalChip href={project.url} label="Live project" />
                      )}
                      {project.repoUrl && (
                        <ExternalChip href={project.repoUrl} label="Source" icon={GitBranch} />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'repositories',
      label: 'Repositories',
      count: data.repos.length,
      panel: (
        <SectionCard
          title="Repositories"
          description="Repositories shown here come from the developer's linked GitHub profile."
          action={
            <Button to="/repositories" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              Full view
            </Button>
          }
        >
          {!data.githubConnected ? (
            <EmptyState
              compact
              icon="projects"
              title="No GitHub username on this profile"
              description="The preview keys off the githubUsername field. Add one and the repository section opens up."
              action={
                <Button to="/profile/edit" size="sm">
                  Add username
                </Button>
              }
            />
          ) : data.repos.length === 0 ? (
            <EmptyRow icon={GitBranch}>
              This account has a GitHub username but no public repositories are showing yet.
              <Button to="/repositories" size="sm" className="mt-2">
                See the sample set
              </Button>
            </EmptyRow>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {data.repos.slice(0, 4).map((repo) => (
                <li key={repo.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                    >
                      {repo.name}
                    </a>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      pushed {timeAgo(repo.pushedAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {repo.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                    <span className="inline-flex items-center gap-1">
                      <Star aria-hidden className="h-3.5 w-3.5" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork aria-hidden className="h-3.5 w-3.5" />
                      {formatNumber(repo.forks)}
                    </span>
                    <span>{repo.language}</span>
                    {repo.isPinned && <Badge tone="info">Pinned</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'preferences',
      label: 'Preferences',
      panel: (
        <SectionCard
          title="Job preferences"
          description="These are the fields the matcher reads besides your skills."
          action={<EditAction />}
        >
          {!actsAs(user.role, 'developer') ? (
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Match preferences apply to developer accounts only — they are what a posting is scored
              against. Your account does not carry them. Notification and privacy settings live in{' '}
              <Link to="/settings" className="text-[var(--color-accent)] hover:underline">
                Settings
              </Link>
              .
            </p>
          ) : (
            <>
              <DetailList
                columns={2}
                items={[
                  {
                    label: 'Work mode',
                    value: store.statusLabel(preferences.workMode ?? 'any'),
                  },
                  {
                    label: 'Target level',
                    value: store.statusLabel(preferences.experienceLevel ?? user.experienceLevel),
                  },
                  {
                    label: 'Role types',
                    value:
                      (preferences.roleTypes ?? []).length > 0 ? (
                        <span className="flex flex-wrap gap-1">
                          {preferences.roleTypes.map((type) => (
                            <Badge key={type}>{store.statusLabel(type)}</Badge>
                          ))}
                        </span>
                      ) : (
                        'Not set — every type is allowed'
                      ),
                  },
                  {
                    label: 'Locations',
                    value:
                      (preferences.locations ?? []).length > 0 ? (
                        preferences.locations.join(', ')
                      ) : (
                        'Not set — location is not filtered'
                      ),
                  },
                ]}
              />
              <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                Work mode contributes {MATCH_WEIGHTS.workMode} points and target level{' '}
                {MATCH_WEIGHTS.experience} of the {totalWeight()} available. Locations and role types
                are stored and shown to recruiters but are not part of the score.
              </p>
            </>
          )}
        </SectionCard>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Your profile"
        title="Profile"
        description="What other accounts see, plus the exact fields the matcher scores you on. Every edit happens on the edit screen."
        actions={
          <Button to="/profile/edit" icon={Pencil}>
            Edit profile
          </Button>
        }
      />

      <SectionCard padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <Avatar name={user.name} src={user.avatar ?? undefined} size="2xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
              {user.name}
            </h2>
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {user.headline || 'No headline yet.'}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-text-tertiary)]">
              {user.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                  {user.location}
                </span>
              )}
              {isDeveloper && (
                <span className="inline-flex items-center gap-1">
                  <Building2 aria-hidden className="h-3.5 w-3.5" />
                  {store.statusLabel(user.experienceLevel ?? 'mid')}
                  {user.yearsOfExperience ? ` · ${user.yearsOfExperience} yrs` : ''}
                </span>
              )}
              {user.openTo && <span>{OPEN_TO_LABEL[user.openTo] ?? store.statusLabel(user.openTo)}</span>}
              <span className="inline-flex items-center gap-1">
                <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                Joined {timeAgo(user.createdAt)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={visibility.label === 'Public' ? 'success' : 'neutral'}>{visibility.label}</Badge>
              <Badge tone={user.emailVerified ? 'success' : 'warning'}>
                {user.emailVerified ? 'Email verified' : 'Email not verified'}
              </Badge>
              {!user.emailVerified && (
                <Link
                  to="/verify-email"
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  Verify it
                </Link>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {user.website && <ExternalChip href={user.website} label="Website" />}
              {user.linkedIn && (
                <ExternalChip
                  href={`https://www.linkedin.com/${user.linkedIn.replace(/^\/+/, '')}`}
                  label="LinkedIn"
                />
              )}
              {user.githubUsername && (
                <ExternalChip
                  href={`https://github.com/${user.githubUsername}`}
                  label="GitHub"
                  icon={GitBranch}
                />
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {completion.percent < 100 && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Profile is {completion.percent}% complete
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Missing: {completion.missing.join(', ')}. Each one is a check in the same fixed list
                the dashboard uses, so finishing them is the cheapest way to stop a profile being
                skipped.
              </p>
            </div>
            <Button to="/profile/edit" size="sm" icon={ArrowRight} iconPosition="right">
              Complete profile
            </Button>
          </div>
          <ProgressBar
            className="mt-3"
            value={completion.percent}
            label="Required fields filled"
            showValue
            tone="accent"
          />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Profile sections" />
          <div className="pt-4">
            <TabPanels tabs={tabs} activeTab={activeTab} />
          </div>
        </div>

        <div className="space-y-4">
          <SectionCard title="Who can see this">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {visibility.body}
            </p>
            <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              <code>visibility</code> is stored on your profile and displayed here, but developer
              search does not filter on it yet. Treat the setting as stated intent, not an enforced
              lock.
            </p>
            <Button to="/profile/edit" variant="outline" size="sm" className="mt-3">
              Change visibility
            </Button>
          </SectionCard>

          <SectionCard
            title="What the matcher reads"
            description="A documented weighted heuristic, not a trained model."
          >
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <WeightRow label="Required skill coverage" points={MATCH_WEIGHTS.required} />
              <WeightRow label="Preferred skill coverage" points={MATCH_WEIGHTS.preferred} />
              <WeightRow label="Experience level alignment" points={MATCH_WEIGHTS.experience} />
              <WeightRow label="Work mode alignment" points={MATCH_WEIGHTS.workMode} />
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-tertiary)]">Skills compared</dt>
                <dd className="tabular-nums text-[var(--color-text-secondary)]">
                  {pluralize(data.skills.length, 'skill')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-tertiary)]">Level used</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {store.statusLabel(user.experienceLevel ?? preferences.experienceLevel ?? 'mid')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-tertiary)]">Work mode used</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {store.statusLabel(preferences.workMode ?? 'any')}
                </dd>
              </div>
            </dl>
            {data.topMatch ? (
              <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  Your current best posting
                </p>
                <Link
                  to={`/jobs/${data.topMatch.id}`}
                  className="mt-1.5 block text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                >
                  {data.topMatch.title}
                </Link>
                <MatchMeter className="mt-2" match={data.topMatch.match} size="lg" />
              </div>
            ) : (
              <EmptyRow className="mt-4" icon={Sparkles}>
                No scored postings. Add skills and preferences, then check{' '}
                <Link to="/recommendations" className="text-[var(--color-accent)] hover:underline">
                  matches
                </Link>
                .
              </EmptyRow>
            )}
          </SectionCard>

          <SectionCard title="Profile at a glance">
            <DetailList
              dense
              items={[
                { label: 'Email', value: user.email },
                { label: 'Account type', value: store.statusLabel(user.role) },
                { label: 'Headline', value: user.headline || 'Not set' },
                { label: 'Location', value: user.location || 'Not set' },
                { label: 'Resume file', value: user.resume || 'Not uploaded' },
                { label: 'Projects', value: String(data.myProjects.length) },
                { label: 'Repositories in preview', value: String(data.repos.length) },
              ]}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function EditAction() {
  return (
    <Button to="/profile/edit" variant="ghost" size="sm" icon={Pencil}>
      Edit
    </Button>
  );
}

function WeightRow({ label, points }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span>{label}</span>
      <span className="shrink-0 tabular-nums text-xs text-[var(--color-text-tertiary)]">
        {points} pts
      </span>
    </li>
  );
}

function ExternalChip({ href, label, icon: Icon = ExternalLink }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

function periodLabel(startYear, endYear) {
  if (!startYear && !endYear) return 'Dates not listed';
  if (startYear && !endYear) return `${startYear} — current`;
  return `${startYear} — ${endYear}`;
}

function totalWeight() {
  return Object.values(MATCH_WEIGHTS).reduce((sum, value) => sum + value, 0);
}

export default Profile;
