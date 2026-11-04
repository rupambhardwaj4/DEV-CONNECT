import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context';
import { useStoreValue } from '../hooks/useStore';
import { useDebounce } from '../hooks/useDebounce';
import { jobs as jobsApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { FilterChips, FilterPanel } from '../components/common/FilterPanel';
import { SearchBar } from '../components/common/SearchBar';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Avatar } from '../components/common/Avatar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { SkillList } from '../components/common/Tag';
import { MatchMeter } from '../components/common/MatchMeter';
import { Pagination, ResultsCount } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { formatSalary, timeAgo } from '../utils/format';

const PER_PAGE = 8;

/** store param name -> URL param name */
const URL_KEYS = {
  query: 'q',
  location: 'location',
  minSalary: 'salary',
  workMode: 'workMode',
  jobType: 'jobType',
  experienceLevel: 'level',
  requiredSkills: 'skill',
};

const FACET_KEYS = ['workMode', 'jobType', 'experienceLevel', 'requiredSkills'];

// Each store filter key (singular) maps to its aggregated facet array (plural) in getJobFacets().
const FACET_SOURCE = {
  workMode: 'workModes',
  jobType: 'jobTypes',
  experienceLevel: 'experienceLevels',
  requiredSkills: 'skills',
};

const FACET_LABELS = {
  workMode: 'Work mode',
  jobType: 'Employment type',
  experienceLevel: 'Experience',
  requiredSkills: 'Skills',
};

const readable = (value) => String(value).replace(/-/g, ' ');

function fromParams(params) {
  const filters = {
    query: params.get('q') ?? '',
    location: params.get('location') ?? '',
    minSalary: Number(params.get('salary')) || 0,
    sort: params.get('sort') ?? 'recent',
    page: Number(params.get('page')) || 1,
  };
  for (const key of FACET_KEYS) filters[key] = params.getAll(URL_KEYS[key]);
  return filters;
}

function toParams(filters) {
  const next = new URLSearchParams();
  for (const [key, urlKey] of Object.entries(URL_KEYS)) {
    if (key === 'query') continue;
    const value = filters[key];
    if (Array.isArray(value)) {
      for (const item of value) next.append(urlKey, item);
    } else if (value) {
      next.set(urlKey, String(value));
    }
  }
  if (filters.query) next.set('q', filters.query);
  if (filters.sort && filters.sort !== 'recent') next.set('sort', filters.sort);
  if (filters.page > 1) next.set('page', String(filters.page));
  return next;
}

export function Jobs() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, isDeveloper } = useAuth();
  const [params, setParams] = useSearchParams();
  const [searchText, setSearchText] = useState(() => params.get('q') ?? '');
  const [saving, setSaving] = useState(null);

  const debouncedSearch = useDebounce(searchText, 250);
  const filters = useMemo(() => fromParams(params), [params]);

  const write = useCallback(
    (patch) => setParams(toParams({ ...fromParams(params), ...patch }), { replace: true }),
    [params, setParams],
  );

  const boardQuery = useMemo(
    () => ({
      ...filters,
      query: debouncedSearch,
      minSalary: filters.minSalary || undefined,
      status: 'published',
      savedBy: user?.id,
      matchFor: isDeveloper ? user.id : undefined,
      perPage: PER_PAGE,
    }),
    [filters, debouncedSearch, user, isDeveloper],
  );

  // The saved flag travels inside the query result, so a bookmark click has to re-run it or the
  // card keeps answering "Save" for a role that is already saved.
  const results = useStoreValue(() => jobsApi.query(boardQuery), [boardQuery]);
  const facets = useMemo(() => jobsApi.facets(), []);

  const groups = useMemo(
    () =>
      FACET_KEYS.map((key) => {
        const source = facets[FACET_SOURCE[key]] ?? [];
        const optionValues = key === 'requiredSkills' ? source.slice(0, 16) : source;
        return {
          name: key,
          label: FACET_LABELS[key],
          type: 'checkbox',
          value: filters[key],
          options: optionValues.map((value) => ({
            value,
            label: readable(value),
            // Count with this facet's own selection ignored, so numbers never contradict the list.
            count: jobsApi.query({
              ...boardQuery,
              [key]: [value],
              page: 1,
              perPage: 1,
            }).total,
          })),
        };
      }),
    [facets, boardQuery, filters],
  );

  const chips = useMemo(() => {
    const list = [];
    for (const key of FACET_KEYS) {
      for (const value of filters[key]) {
        list.push({ name: key, value, label: `${FACET_LABELS[key]}: ${readable(value)}` });
      }
    }
    if (filters.minSalary) {
      list.push({ name: 'minSalary', value: filters.minSalary, label: `Min ${filters.minSalary.toLocaleString()}` });
    }
    if (filters.location) list.push({ name: 'location', value: filters.location, label: `Near “${filters.location}”` });
    return list;
  }, [filters]);

  function onFilterChange(patch) {
    write({ ...patch, page: 1 });
  }

  function removeChip(chip) {
    if (chip.name === 'minSalary') write({ minSalary: 0, page: 1 });
    else if (chip.name === 'location') write({ location: '', page: 1 });
    else write({ [chip.name]: filters[chip.name].filter((value) => value !== chip.value), page: 1 });
  }

  function clearAll() {
    setSearchText('');
    setParams(toParams({ ...fromParams(params), query: '', location: '', minSalary: 0, page: 1 }), {
      replace: true,
    });
  }

  async function toggleSave(job) {
    setSaving(job.id);
    if (job.isSaved) await jobsApi.unsave(user.id, job.id);
    else await jobsApi.save(user.id, job.id);
    setSaving(null);
    toast.success(job.isSaved ? `Unsaved ${job.title}` : `Saved ${job.title}`, {
      action: job.isSaved
        ? undefined
        : { label: 'Open saved list', onClick: () => navigate('/saved') },
    });
  }

  if (!user) return null;

  const sorts = isDeveloper
    ? [
        { value: 'recent', label: 'Newest' },
        { value: 'match', label: 'Best match' },
        { value: 'salary-high', label: 'Pay: high' },
        { value: 'salary-low', label: 'Pay: low' },
        { value: 'soonest', label: 'Closing soon' },
      ]
    : [
        { value: 'recent', label: 'Newest' },
        { value: 'salary-high', label: 'Pay: high' },
        { value: 'soonest', label: 'Closing soon' },
      ];

  return (
    <div>
      <PageHeader
        title="Job board"
        description={`${results.total} published ${results.total === 1 ? 'role' : 'roles'} from ${facets.companies.length} companies. Filters and sorting run against the real dataset.`}
        actions={
          <>
            <Button to="/matches" variant="outline" icon={SlidersHorizontal}>
              Matched for me
            </Button>
            <Button to="/saved" variant="ghost" icon={Bookmark}>
              Saved
            </Button>
          </>
        }
      />

      <div className="flex items-start gap-6">
        <FilterPanel
          groups={groups}
          onChange={onFilterChange}
          onClear={clearAll}
          activeCount={chips.length}
          resultLabel={`${results.total} ${results.total === 1 ? 'role' : 'roles'} showing`}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[12rem] flex-1">
                <label htmlFor="jobs-search" className="sr-only">
                  Search jobs
                </label>
                <SearchBar
                  id="jobs-search"
                  placeholder="Title, company, skill or location"
                  value={searchText}
                  onChange={(value) => {
                    setSearchText(value);
                    write({ query: value, page: 1 });
                  }}
                />
              </div>
              <SegmentedControl
                ariaLabel="Sort jobs"
                size="sm"
                value={filters.sort}
                onChange={(sort) => write({ sort, page: 1 })}
                options={sorts}
              />
            </div>

            <FilterChips chips={chips} onRemove={removeChip} onClear={clearAll} />

            <ResultsCount
              total={results.total}
              shown={results.items.length}
              noun="roles"
              singular="role"
              query={debouncedSearch || undefined}
              className="text-xs"
            />
          </div>

          {results.items.length === 0 ? (
            <EmptyState
              icon="search"
              title="No roles match these filters"
              description={
                chips.length
                  ? 'Drop one filter at a time. Skills and the minimum salary are the two that most often empty the board.'
                  : 'There are no open postings right now. Check back soon, or adjust your filters to widen the search.'
              }
              action={
                chips.length ? (
                  <Button onClick={clearAll} size="sm" variant="outline">
                    Clear filters
                  </Button>
                ) : (
                  <Button to="/settings" size="sm" variant="outline">
                    Open settings
                  </Button>
                )
              }
            />
          ) : (
            <ul className="space-y-3">
              {results.items.map((job) => (
                <li key={job.id}>
                  <JobCard
                    job={job}
                    developerView={isDeveloper}
                    saving={saving === job.id}
                    onSave={() => toggleSave(job)}
                  />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={results.page}
            totalPages={results.totalPages}
            onPageChange={(page) => {
              write({ page });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, developerView, saving, onSave }) {
  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)]">
      <div className="flex items-start gap-3">
        <Avatar name={job.company?.name ?? job.title} size="lg" square />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] sm:text-base">
                <Link to={`/jobs/${job.id}`} className="hover:text-[var(--color-accent)]">
                  {job.title}
                </Link>
                {job.isFeatured && (
                  <Badge tone="accent" className="ml-2 align-middle">
                    Featured
                  </Badge>
                )}
              </h2>
              <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                {job.company?.name ?? 'DevConnect'} · {job.location}
              </p>
            </div>
            <IconButton
              icon={Bookmark}
              label={job.isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
              variant={job.isSaved ? 'solid' : 'ghost'}
              onClick={onSave}
              disabled={saving}
            />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <StatusBadge status={job.workMode} kind="workMode" />
            <Badge>{readable(job.jobType)}</Badge>
            <Badge>{readable(job.experienceLevel)}</Badge>
            {job.salary && (
              <span className="font-medium text-[var(--color-text-primary)]">{formatSalary(job.salary)}</span>
            )}
            <span className="text-[var(--color-text-tertiary)]">Posted {timeAgo(job.postedAt)}</span>
            {job.applyDeadline && (
              <span className="text-[var(--color-text-tertiary)]">Closes {timeAgo(job.applyDeadline)}</span>
            )}
          </div>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {job.description}
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <SkillList
              skills={job.requiredSkills}
              matched={job.match?.matchedSkills}
              missing={job.match?.missingSkills}
              max={6}
            />
            <div className="flex items-center gap-3">
              {developerView && job.match && <MatchMeter match={job.match} className="w-32" />}
              {job.hasApplied ? (
                <Badge tone="success">Applied</Badge>
              ) : (
                <Button to={`/jobs/${job.id}`} size="sm">
                  View role
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default Jobs;
