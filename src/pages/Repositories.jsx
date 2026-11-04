import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Code2,
  GitBranch,
  Pin,
  Plus,
  Pencil,
  Search,
  Star,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context';
import { useStoreValue, store } from '../hooks/useStore';
import { github, developers, demo, projects as projectsApi, usingApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { TextInput, TextField, TextAreaField, ValidationError } from '../components/common/Field';
import { Select } from '../components/common/Select';
import { Toggle } from '../components/common/Toggle';
import { Tag } from '../components/common/Tag';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ContributionGrid } from '../components/common/ContributionGrid';
import { EmptyState, NoSearchResults } from '../components/common/EmptyState';
import { SkillList } from '../components/common/Tag';
import { useToast } from '../components/common/Toast';
import { formatNumber, timeAgo, formatDay } from '../utils/format';

/** GitHub allows 1-39 chars: alphanumerics and single internal hyphens. */
const HANDLE_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const URL_PATTERN = /^https?:\/\/\S+\.\S+/i;
/** The store slices `period` to 40 chars; a year or a year range is what it means. */
const PERIOD_PATTERN = /^\d{4}(?:\s*(?:-|–|—)\s*(?:present|now|current|\d{4}))?$/i;

const MAX_PROJECT_TECH = 10;

const SORTS = [
  { value: 'pinned', label: 'Pinned first' },
  { value: 'stars', label: 'Most stars' },
  { value: 'recent', label: 'Recently pushed' },
  { value: 'name', label: 'Name A–Z' },
];

const EMPTY_PROJECT = {
  id: null,
  title: '',
  summary: '',
  tags: [],
  url: '',
  repoUrl: '',
  period: '',
  featured: false,
};

/** Stable identity for the blank form, so `?project=new` does not re-seed it on every render. */
const BLANK_PROJECT_DRAFT = { ...EMPTY_PROJECT };

/** Deterministic dot tint per language, so it never re-rolls between renders. */
function languageTint(language) {
  const hues = [212, 158, 24, 280, 350, 190, 45];
  const key = String(language ?? '').toLowerCase();
  let sum = 0;
  for (let i = 0; i < key.length; i += 1) sum += key.charCodeAt(i);
  return `hsl(${hues[sum % hues.length]} 55% 46%)`;
}

function normalizeHandle(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\/+$/, '');
}

function sortRepositories(list, sort) {
  const rows = [...list];
  rows.sort((a, b) => {
    if (sort === 'stars') return b.stars - a.stars;
    if (sort === 'recent') return Date.parse(b.pushedAt) - Date.parse(a.pushedAt);
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.stars - a.stars;
  });
  return rows;
}

function validateProject(form) {
  const errors = {};
  const title = form.title.trim();
  const summary = form.summary.trim();

  if (!title) errors.title = 'A title is required.';
  else if (title.length < 3) errors.title = 'Use at least three characters.';

  if (!summary) errors.summary = 'Say what the project does, in one or two sentences.';
  else if (summary.length > 800) errors.summary = 'Keep it under 800 characters.';

  for (const key of ['url', 'repoUrl']) {
    const value = form[key].trim();
    if (value && !URL_PATTERN.test(value)) errors[key] = 'Start the link with http:// or https://.';
  }

  if (form.period.trim() && !PERIOD_PATTERN.test(form.period.trim())) {
    errors.period = 'Use a year or a range, e.g. 2024 or 2023 – 2025.';
  }

  return errors;
}

export function Repositories() {
  const toast = useToast();
  const { userId, isDeveloper } = useAuth();

  // Every read goes through useStoreValue: the store returns the same user object identity
  // when only repositories or projects changed, so a `[user]` memo would go stale.
  const user = useStoreValue(() => (userId ? store.getUser(userId) : null), [userId]);
  const ownProfile = useStoreValue(() => (userId ? github.profile(userId) : null), [userId]);
  const sampleAccount = useStoreValue(() => demo.accounts().find((a) => a.label === 'Developer') ?? null, []);
  const sampleUser = useStoreValue(
    () => (sampleAccount ? store.getUser(sampleAccount.userId) : null),
    [sampleAccount?.userId],
  );
  const sampleProfile = useStoreValue(
    () => (sampleAccount ? github.profile(sampleAccount.userId) : null),
    [sampleAccount?.userId],
  );
  const myProjects = useStoreValue(() => (userId ? projectsApi.forUser(userId) : []), [userId]);

  const connected = Boolean(userId && github.isConnected(userId));
  // Only the served transport can reach GitHub; offline this screen stays a preview.
  const served = usingApi();
  const [showSample, setShowSample] = useState(false);
  const viewingSample = showSample && !connected;
  const profile = viewingSample ? sampleProfile : ownProfile;

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('pinned');
  const [pendingRepoId, setPendingRepoId] = useState(null);

  const [handleDraft, setHandleDraft] = useState(() => user?.githubUsername ?? '');
  const [handleError, setHandleError] = useState(null);
  const [savingHandle, setSavingHandle] = useState(false);
  const [importing, setImporting] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const [projectDraft, setProjectDraft] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // "Add a project" from the profile screen lands here with ?project=new, so the form opens on
  // arrival rather than asking for a second click on this page. Deriving the open state from the
  // URL keeps a single source of truth — and works when the link is followed from inside the app,
  // where this component never remounts.
  const [searchParams, setSearchParams] = useSearchParams();
  const openFromLink = searchParams.get('project') === 'new';
  const activeDraft = projectDraft ?? (openFromLink ? BLANK_PROJECT_DRAFT : null);

  function closeProjectDraft() {
    setProjectDraft(null);
    if (openFromLink) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('project');
          return next;
        },
        { replace: true },
      );
    }
  }

  const repositories = useMemo(() => {
    const all = sortRepositories(profile?.repositories ?? [], sort);
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (repo) =>
        repo.name.toLowerCase().includes(needle) ||
        (repo.description ?? '').toLowerCase().includes(needle) ||
        (repo.topics ?? []).some((topic) => topic.toLowerCase().includes(needle)),
    );
  }, [profile, query, sort]);

  const pinnedCount = (profile?.repositories ?? []).filter((repo) => repo.isPinned).length;

  async function togglePinned(repo) {
    setPendingRepoId(repo.id);
    const result = await github.setPinned(repo.id, !repo.isPinned);
    setPendingRepoId(null);
    if (!result || result === false) {
      toast.error('The store refused the change. Nothing was pinned.', { title: 'Not saved' });
      return;
    }
    toast.success(repo.isPinned ? `Unpinned ${repo.name}.` : `Pinned ${repo.name} to your profile.`);
  }

  async function saveHandle(event) {
    event.preventDefault();
    const value = normalizeHandle(handleDraft);
    if (!HANDLE_PATTERN.test(value)) {
      setHandleError('Use 1–39 characters: letters, digits and single hyphens.');
      return;
    }
    setHandleError(null);
    setSavingHandle(true);
    const result = await developers.update(userId, { githubUsername: value });
    setSavingHandle(false);
    if (!result || result.error) {
      toast.error(result?.error ?? 'The store refused the change.', { title: 'Handle not saved' });
      return;
    }
    setHandleDraft(value);
    setShowSample(false);
    toast.success(`Handle set to ${value}.`, {
      title: 'Saved',
      message: served
        ? 'Saved to your profile. Use Import repositories to pull the public rows through the API.'
        : 'Saved to your profile. The repositories below are sample data until you connect GitHub.',
    });
  }

  async function importRepositories() {
    const value = normalizeHandle(handleDraft);
    if (!HANDLE_PATTERN.test(value)) {
      setHandleError('Enter the handle you want to import before running the import.');
      return;
    }
    setImporting(true);
    const result = await github.connect(value);
    setImporting(false);
    if (!result.ok) {
      toast.error(result.error, { title: 'Nothing imported' });
      return;
    }
    const imported = result.repositories.filter((repo) => repo.id.startsWith('gh-')).length;
    toast.success(`Imported ${imported} public repositories from @${value}.`, {
      title: 'GitHub synced',
      message: 'The API read GitHub and wrote the rows under your account.',
    });
  }

  async function disconnectGitHub() {
    setDisconnecting(true);
    const result = await github.disconnect();
    setDisconnecting(false);
    if (!result.ok) {
      toast.error(result.error, { title: 'Still connected' });
      return;
    }
    setDisconnectOpen(false);
    setHandleDraft('');
    toast.success('GitHub unlinked.', {
      title: 'Disconnected',
      message: 'The imported rows are gone; repositories you added yourself are untouched.',
    });
  }

  async function saveProject(input) {
    const result = await projectsApi.upsert(userId, input);
    if (!result || result.error) {
      toast.error(result?.error ?? 'The store refused the change.', { title: 'Project not saved' });
      return false;
    }
    toast.success(input.id ? 'Project updated.' : 'Project added.', {
      message: 'Saved to your profile.',
    });
    return true;
  }

  async function confirmDeleteProject() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await projectsApi.remove(userId, deleteTarget.id);
    setDeleting(false);
    if (result?.ok === false) {
      toast.error(result.error ?? 'The store refused the delete.', { title: 'Project not removed' });
      return;
    }
    toast.success(`Removed “${deleteTarget.title}”.`);
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="GitHub preview and projects"
        description="Connect GitHub to import your repositories. Until then you can preview a sample profile, and your Projects below are fully editable and saved."
      />

      {!isDeveloper ? (
        <SectionCard padding="none">
          <EmptyState
            icon="projects"
            title="Repositories are a developer view"
            description="GitHub preview is available on developer accounts. Switch to a developer account to see it."
            action={<Button to="/" size="sm">Back to overview</Button>}
          />
        </SectionCard>
      ) : (
        <div className="space-y-4">
          {!connected && !showSample ? (
            <SectionCard
              title="No GitHub account is connected"
              description="Link a GitHub account to pull in live repositories, or preview a sample profile without connecting."
            >
              <div className="space-y-4">
                <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Preview with sample data</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Shows the sample repositories, stars and contribution grid for{' '}
                    {sampleProfile ? `${sampleProfile.displayName} (@${sampleProfile.username})` : 'a sample developer'}.
                    Nothing is written to your profile.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    icon={ArrowLeftRight}
                    onClick={() => setShowSample(true)}
                  >
                    Load sample data
                  </Button>
                </div>

                <form
                  onSubmit={saveHandle}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-3"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Or put a handle on your own profile
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {served ? (
                      <>
                        Saving the handle only labels your profile. <strong>Import repositories</strong> asks the API to
                        read that account on GitHub and store the public repository metadata under yours — the browser
                        never sees a GitHub credential.
                      </>
                    ) : (
                      <>
                        This saves your GitHub handle to your profile. It sets the label this preview uses — repositories
                        aren&apos;t applied until you connect GitHub. The usual place to edit it is{' '}
                        <Link
                          to="/profile/edit"
                          className="text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-accent)]"
                        >
                          profile editing
                        </Link>
                        .
                      </>
                    )}
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <TextField
                        label="GitHub handle"
                        icon={Code2}
                        value={handleDraft}
                        onChange={(event) => {
                          setHandleDraft(event.target.value);
                          if (handleError) setHandleError(null);
                        }}
                        placeholder="priyarman"
                        error={handleError}
                        invalid={Boolean(handleError)}
                        autoComplete="off"
                        spellCheck={false}
                        hint="1–39 characters. Letters, digits and single hyphens."
                      />
                    </div>
                    <Button type="submit" icon={UserPlus} loading={savingHandle} className="sm:mt-7">
                      Save handle
                    </Button>
                    {served && (
                      <Button
                        type="button"
                        variant="outline"
                        icon={ArrowLeftRight}
                        loading={importing}
                        className="sm:mt-7"
                        onClick={importRepositories}
                      >
                        Import repositories
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </SectionCard>
          ) : !profile ? (
            <SectionCard padding="none">
              <EmptyState
                icon="projects"
                title="No GitHub data to show"
                description={
                  viewingSample
                    ? 'The sample developer has no GitHub data to preview right now. Reset your workspace from Settings to restore it.'
                    : 'Your profile has no GitHub handle yet, so there is nothing for the service to render.'
                }
                action={
                  viewingSample ? (
                    <Button size="sm" to="/settings">
                      Open settings
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setShowSample(true)} icon={ArrowLeftRight}>
                      Load sample data
                    </Button>
                  )
                }
              />
            </SectionCard>
          ) : (
            <SectionCard
              title={viewingSample ? 'Sample GitHub profile' : 'Your GitHub preview'}
              description={
                viewingSample
                  ? 'Sample view: this is sample data for another account, not your profile. Pinning is disabled here.'
                  : served
                    ? `@${profile.username} — these rows are yours in the database. Import repositories replaces the GitHub-sourced ones with what GitHub reports today.`
                    : `Handle saved on your profile as @${profile.username}. The repositories shown are sample data until you connect GitHub.`
              }
              padding="none"
              action={
                viewingSample ? (
                  <Button variant="outline" size="sm" onClick={() => setShowSample(false)}>
                    Leave sample view
                  </Button>
                ) : served ? (
                  // The preview copy tells the user to run an import, so the button has to stay
                  // here once a handle is saved — that is exactly when an import is useful.
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowSample(true)}>
                      View sample data
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDisconnectOpen(true)}
                    >
                      Disconnect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowLeftRight}
                      loading={importing}
                      onClick={importRepositories}
                    >
                      Import repositories
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" icon={ArrowLeftRight} onClick={() => setShowSample(true)}>
                    View sample data
                  </Button>
                )
              }
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={profile.displayName} src={(viewingSample ? sampleUser : user)?.avatar} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {profile.displayName}
                    </p>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                    >
                      github.com/{profile.username}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    <GitBranch className="h-3.5 w-3.5" aria-hidden />
                    {profile.repositoryCount} repos
                  </Badge>
                  <Badge variant="outline">
                    <Star className="h-3.5 w-3.5" aria-hidden />
                    {formatNumber(profile.totalStars)} stars
                  </Badge>
                  <Badge variant="outline">{formatNumber(profile.totalForks)} forks</Badge>
                  <Badge variant="default">source: {profile.source}</Badge>
                </div>
              </div>

              {(profile.contributions.length > 0 || profile.languages.length > 0) && (
                <div className="border-t border-[var(--color-border)] p-4">
                  {profile.contributions.length > 0 && <ContributionGrid values={profile.contributions} />}
                  {profile.languages.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        Languages
                      </span>
                      {profile.languages.map((language) => (
                        <span
                          key={language}
                          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: languageTint(language) }}
                            aria-hidden
                          />
                          {language}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {profile.repositoryCount === 0 ? (
                <div className="border-t border-[var(--color-border)]">
                  <EmptyState
                    icon="projects"
                    compact
                    title="No repositories to show for this account"
                    description="GitHub activity is only shown for accounts that connect it, and none of it is attributed to you yet. Your handle is saved; the projects below are yours to fill."
                    action={
                      <Button size="sm" variant="outline" onClick={() => setShowSample(true)} icon={ArrowLeftRight}>
                        Load sample data
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="border-t border-[var(--color-border)]">
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <TextInput
                        icon={Search}
                        type="search"
                        aria-label="Search repositories"
                        placeholder="Filter by name, description or topic"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                    <div className="sm:w-48">
                      <label htmlFor="repo-sort" className="sr-only">
                        Sort repositories
                      </label>
                      <Select
                        id="repo-sort"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                        options={SORTS}
                      />
                    </div>
                  </div>

                  {repositories.length === 0 ? (
                    <NoSearchResults query={query} action={<Button size="sm" variant="outline" onClick={() => setQuery('')}>Clear filter</Button>} />
                  ) : (
                    <ul className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
                      {repositories.map((repo) => (
                        <li key={repo.id} className="flex gap-3 p-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                              >
                                <span className="truncate">{repo.name}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              </a>
                              {repo.isPinned && (
                                <Badge variant="accent" size="sm">
                                  <Pin className="h-3 w-3" aria-hidden />
                                  Pinned
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                              {repo.description}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-text-tertiary)]">
                              {repo.language && (
                                <span className="inline-flex items-center gap-1.5">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ background: languageTint(repo.language) }}
                                    aria-hidden
                                  />
                                  {repo.language}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3.5 w-3.5" aria-hidden />
                                {formatNumber(repo.stars)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <GitBranch className="h-3.5 w-3.5" aria-hidden />
                                {formatNumber(repo.forks)}
                              </span>
                              {repo.openIssues > 0 && <span>{repo.openIssues} open issues</span>}
                              <span title={formatDay(repo.pushedAt)}>pushed {timeAgo(repo.pushedAt)}</span>
                            </div>
                            {repo.topics?.length > 0 && (
                              <SkillList skills={repo.topics} max={6} className="mt-3" emptyLabel="" />
                            )}
                          </div>
                          {viewingSample ? null : (
                            <IconButton
                              icon={Pin}
                              label={repo.isPinned ? `Unpin ${repo.name}` : `Pin ${repo.name}`}
                              variant="solid"
                              active={repo.isPinned}
                              disabled={pendingRepoId === repo.id}
                              onClick={() => togglePinned(repo)}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="border-t border-[var(--color-border)] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                    {pinnedCount > 0
                      ? `${pinnedCount} repo${pinnedCount === 1 ? '' : 's'} pinned. Pinned repositories surface first on your profile.`
                      : 'No repositories pinned yet.'}{' '}
                    Stars, forks and the contribution grid are sample figures, not live counts.
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard
            padding="none"
            title="My projects"
            description="Written by you, saved to your profile, and shown publicly. These are yours to manage."
            action={
              !activeDraft && !deleteTarget ? (
                <Button size="sm" icon={Plus} onClick={() => setProjectDraft({ ...EMPTY_PROJECT })}>
                  Add project
                </Button>
              ) : null
            }
          >
            {myProjects.length === 0 ? (
              <EmptyState
                icon="projects"
                compact
                title="No projects listed yet"
                description="Two or three projects that show a decision you made beat ten toy apps. Add the first one now."
                action={
                  <Button size="sm" icon={Plus} onClick={() => setProjectDraft({ ...EMPTY_PROJECT })}>
                    Add a project
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {myProjects.map((project) => (
                  <li key={project.id} className="flex gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="min-w-0 truncate text-sm font-semibold text-[var(--color-text-primary)]">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <Badge variant="accent" size="sm">
                            <Star className="h-3 w-3" aria-hidden />
                            Featured
                          </Badge>
                        )}
                        {project.period && <span className="text-xs text-[var(--color-text-tertiary)]">{project.period}</span>}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{project.summary}</p>
                      {project.tags?.length > 0 && (
                        <SkillList skills={project.tags} max={8} className="mt-3" emptyLabel="" />
                      )}
                      {(project.url || project.repoUrl) && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-4">
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                            >
                              Live site
                              <ArrowUpRight className="h-3 w-3" aria-hidden />
                            </a>
                          )}
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                            >
                              Source
                              <ArrowUpRight className="h-3 w-3" aria-hidden />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <IconButton
                        icon={Pencil}
                        label={`Edit ${project.title}`}
                        onClick={() =>
                          setProjectDraft({
                            ...EMPTY_PROJECT,
                            ...project,
                            tags: [...(project.tags ?? [])],
                            url: project.url ?? '',
                            repoUrl: project.repoUrl ?? '',
                            period: project.period ?? '',
                          })
                        }
                      />
                      <IconButton
                        icon={Trash2}
                        label={`Delete ${project.title}`}
                        variant="danger"
                        onClick={() => setDeleteTarget(project)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <p className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Connect GitHub to replace this preview with your live repositories. Until then the sample data below
            stands in for a connected account, and your projects are saved straight to your profile.
          </p>
        </div>
      )}

      {activeDraft && (
        <ProjectModal
          draft={activeDraft}
          onClose={closeProjectDraft}
          onSave={async (input) => {
            const ok = await saveProject(input);
            if (ok) closeProjectDraft();
            return ok;
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteProject}
        loading={deleting}
        danger
        title={deleteTarget ? `Delete “${deleteTarget.title}”?` : 'Delete project?'}
        description="This removes the project from your profile. The change can't be undone."
        confirmLabel="Delete project"
        cancelLabel="Keep it"
      />

      <ConfirmDialog
        isOpen={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={disconnectGitHub}
        loading={disconnecting}
        danger
        title={user?.githubUsername ? `Unlink @${user.githubUsername}?` : 'Unlink GitHub?'}
        description="The API deletes the repositories it imported for you and clears the handle from your profile. Projects you wrote yourself, and the sample rows, stay."
        confirmLabel="Unlink GitHub"
        cancelLabel="Keep it connected"
      />
    </div>
  );
}

function ProjectModal({ draft, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_PROJECT,
    ...draft,
    tags: [...(draft.tags ?? [])],
  }));
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [techDraft, setTechDraft] = useState('');
  const [techMessage, setTechMessage] = useState(null);

  const errors = useMemo(() => validateProject(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTech(event) {
    event.preventDefault();
    const value = techDraft.trim();
    if (!value) return;
    if (form.tags.length >= MAX_PROJECT_TECH) {
      setTechMessage(`List is at ${MAX_PROJECT_TECH} entries. Remove one before adding another.`);
      return;
    }
    if (form.tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTechMessage(`${value} is already listed.`);
      return;
    }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, value] }));
    setTechDraft('');
    setTechMessage(`${value} added.`);
  }

  async function submit(event) {
    event.preventDefault();
    setShowErrors(true);
    if (hasErrors) return;
    setSaving(true);
    const ok = await onSave({
      id: form.id ?? undefined,
      title: form.title.trim(),
      summary: form.summary.trim(),
      tags: form.tags,
      url: form.url.trim() || undefined,
      repoUrl: form.repoUrl.trim() || undefined,
      period: form.period.trim() || undefined,
      featured: form.featured,
    });
    setSaving(false);
    if (!ok) setShowErrors(false);
  }

  return (
    <Modal isOpen onClose={onClose} title={form.id ? 'Edit project' : 'Add a project'} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="Title"
          required
          value={form.title}
          onChange={(event) => set('title', event.target.value)}
          error={showErrors ? errors.title : undefined}
          maxLength={140}
          hint="Name it the way you would say it out loud."
        />
        <TextAreaField
          label="What it does"
          required
          rows={4}
          value={form.summary}
          onChange={(event) => set('summary', event.target.value)}
          error={showErrors ? errors.summary : undefined}
          maxLength={800}
          hint="Problem, approach, one result. The store trims this to 800 characters."
        />

        <div>
          <label htmlFor="project-tech" className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
            Tech stack
          </label>
          <form onSubmit={addTech} className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1">
              <TextInput
                id="project-tech"
                value={techDraft}
                onChange={(event) => {
                  setTechDraft(event.target.value);
                  if (techMessage) setTechMessage(null);
                }}
                placeholder="Postgres"
                autoComplete="off"
                aria-describedby={techMessage ? 'project-tech-message' : undefined}
              />
            </div>
            <Button type="submit" variant="outline" icon={Plus} disabled={!techDraft.trim()}>
              Add
            </Button>
          </form>
          {form.tags.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <li key={tag}>
                  <Tag
                    variant="removable"
                    onRemove={() => {
                      setForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
                      setTechMessage(null);
                    }}
                  >
                    {tag}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
              No tech listed yet. These render as skills on your profile.
            </p>
          )}
          {techMessage && (
            <p id="project-tech-message" className="mt-2 text-xs text-[var(--color-text-secondary)]" role="status">
              {techMessage}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {form.tags.length} of {MAX_PROJECT_TECH} allowed.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Live site URL"
            type="url"
            inputMode="url"
            value={form.url}
            onChange={(event) => set('url', event.target.value)}
            error={showErrors ? errors.url : undefined}
            placeholder="https://example.com"
            hint="Optional."
          />
          <TextField
            label="Source repository URL"
            type="url"
            inputMode="url"
            value={form.repoUrl}
            onChange={(event) => set('repoUrl', event.target.value)}
            error={showErrors ? errors.repoUrl : undefined}
            placeholder="https://github.com/you/repo"
            hint="Optional. A link you actually own."
          />
        </div>

        <TextField
          label="Period"
          value={form.period}
          onChange={(event) => set('period', event.target.value)}
          error={showErrors ? errors.period : undefined}
          placeholder="2024 or 2023 – 2025"
          hint="Optional. A year or a year range."
          maxLength={40}
        />

        {showErrors && hasErrors && <ValidationError>Fix the highlighted fields before saving.</ValidationError>}

        <Toggle
          label="Feature on my profile"
          description="Featured projects sort to the top of the projects section on your profile."
          checked={form.featured}
          onChange={(checked) => set('featured', checked)}
        />

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {form.id ? 'Save project' : 'Add project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default Repositories;
