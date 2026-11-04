import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useAuth } from '../../context';
import { useStoreValue } from '../../hooks/useStore';
import { jobs as jobsApi, recruiter } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { SectionCard } from '../../components/common/Card';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { SearchBar } from '../../components/common/SearchBar';
import { JobTable } from '../../components/common/Table';
import { Menu } from '../../components/common/Menu';
import { Button } from '../../components/common/Button';
import { ResultsCount } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { NoJobs, NoSearchResults } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { pluralize } from '../../utils/format';

const FILTERS = ['all', 'published', 'draft', 'closed'];

export function RecruiterJobs() {
  const navigate = useNavigate();
  const toast = useToast();
  const { userId, isRecruiter } = useAuth();

  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [pending, setPending] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const postings = useStoreValue(
    () => (userId ? recruiter.jobPostings(userId).items : []),
    [userId],
  );

  const counts = useMemo(() => {
    const base = { all: postings.length, published: 0, draft: 0, closed: 0 };
    for (const job of postings) if (base[job.status] != null) base[job.status] += 1;
    return base;
  }, [postings]);

  const rows = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    return postings
      .filter((job) => filter === 'all' || job.status === filter)
      .filter((job) => {
        if (!needle) return true;
        const haystack = [
          job.title,
          ...job.requiredSkills,
          ...job.preferredSkills,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
  }, [postings, filter, searchText]);

  if (!isRecruiter) {
    return (
      <div>
        <PageHeader
          eyebrow="Recruiter workspace"
          title="Postings"
          description="Manage your job postings and open new roles."
        />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Postings are only available to recruiter accounts.
        </p>
      </div>
    );
  }

  async function changeStatus(job, status) {
    setPending(`${job.id}:${status}`);
    const result = await jobsApi.setStatus(job.id, status);
    setPending(null);
    if (result?.ok === false) {
      toast.error(result.error ?? 'That change could not be applied.');
      return;
    }
    toast.success(`“${job.title}” is now ${status}.`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await jobsApi.remove(deleteTarget.id);
    setDeleting(false);
    if (result?.ok === false) {
      toast.error(result.error ?? 'This posting could not be deleted.');
      setDeleteTarget(null);
      return;
    }
    toast.success(`Deleted “${deleteTarget.title}”.`);
    setDeleteTarget(null);
  }

  function rowActions(job) {
    const isPublished = job.status === 'published';
    const busy = pending !== null && pending.startsWith(`${job.id}:`);
    return (
      <Menu
        label={`Actions for ${job.title}`}
        items={[
          {
            id: 'edit',
            label: 'Edit',
            icon: Pencil,
            onSelect: () => navigate(`/recruiter/jobs/${job.id}/edit`),
          },
          {
            id: 'applicants',
            label: 'View applicants',
            icon: Eye,
            disabled: job.applicantCount === 0,
            onSelect: () => navigate(`/recruiter/applicants?job=${job.id}`),
          },
          { separator: true },
          {
            id: 'status',
            label: isPublished ? 'Unpublish' : 'Publish',
            icon: isPublished ? EyeOff : Plus,
            disabled: job.status === 'closed' || busy,
            onSelect: () => changeStatus(job, isPublished ? 'draft' : 'published'),
          },
          {
            id: 'close',
            label: 'Close posting',
            icon: Power,
            disabled: job.status === 'closed' || busy,
            onSelect: () => changeStatus(job, 'closed'),
          },
          { separator: true },
          {
            id: 'delete',
            label: 'Delete',
            icon: Trash2,
            danger: true,
            disabled: busy,
            onSelect: () => setDeleteTarget(job),
          },
        ]}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Recruiter workspace"
        title="Your postings"
        description="Every role you own, including drafts and closed ones. Publish to open a role to applicants, or close it to stop new applications."
        actions={
          <Button to="/recruiter/jobs/new" icon={Plus}>
            Post a job
          </Button>
        }
      />

      <SectionCard
        padding="none"
        className="overflow-hidden"
        action={
          <SegmentedControl
            ariaLabel="Filter postings"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((value) => ({
              value,
              label: value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1),
              count: counts[value],
            }))}
          />
        }
      >
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <label htmlFor="postings-search" className="sr-only">
            Search postings
          </label>
          <SearchBar
            id="postings-search"
            placeholder="Search by title or skill"
            value={searchText}
            onChange={setSearchText}
          />
        </div>

        <div className="p-4">
          {postings.length === 0 ? (
            <NoJobs
              action={
                <Button to="/recruiter/jobs/new" size="sm">
                  Post your first job
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <NoSearchResults
              query={searchText}
              action={
                <Button onClick={() => setSearchText('')} size="sm" variant="outline">
                  Clear search
                </Button>
              }
            />
          ) : (
            <>
              <ResultsCount
                total={rows.length}
                noun="postings"
                singular="posting"
                className="mb-2"
              />
              <JobTable
                jobs={rows}
                onSelect={(job) => navigate(`/recruiter/jobs/${job.id}/edit`)}
                actions={rowActions}
              />
            </>
          )}
        </div>
      </SectionCard>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Delete this posting?"
        confirmLabel={deleteTarget?.applicantCount ? 'Delete anyway' : 'Delete posting'}
        description={
          deleteTarget?.applicantCount
            ? `“${deleteTarget.title}” has ${pluralize(deleteTarget.applicantCount, 'application')}. DevConnect keeps applicant records tied to a live role, so a posting with applicants cannot be deleted — close it instead to stop new applications and keep the pipeline intact.`
            : `“${deleteTarget?.title}” has no applicants. Deleting removes the posting permanently and cannot be undone.`
        }
      />
    </div>
  );
}

export default RecruiterJobs;
