import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bookmark, BookmarkX, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context';
import { useStoreValue, store } from '../../hooks/useStore';
import { applications as applicationsApi, recruiter } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { SectionCard } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { SearchBar } from '../../components/common/SearchBar';
import { Table } from '../../components/common/Table';
import { Select } from '../../components/common/Select';
import { Avatar } from '../../components/common/Avatar';
import { MatchBadge, StatusBadge } from '../../components/common/Badge';
import { SkillList } from '../../components/common/Tag';
import { Sheet } from '../../components/common/Sheet';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Button } from '../../components/common/Button';
import { Field, TextInput, TextAreaField } from '../../components/common/Field';
import { DetailList } from '../../components/common/DetailList';
import { Timeline } from '../../components/common/Timeline';
import { NoApplications, NoSearchResults } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { formatDate, formatDay, timeAgo } from '../../utils/format';

const STATUS_TABS = ['applied', 'under-review', 'interview', 'offer', 'rejected', 'withdrawn'];
const ADVANCE_TARGETS = ['under-review', 'interview', 'offer', 'rejected'];

export function RecruiterApplicants() {
  const toast = useToast();
  const { userId, isRecruiter } = useAuth();
  const [params, setParams] = useSearchParams();

  const status = params.get('status') ?? 'all';
  const jobFilter = params.get('job') ?? 'all';
  const [searchText, setSearchText] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');

  const applications = useStoreValue(
    () => (userId ? applicationsApi.forRecruiter(userId) : []),
    [userId],
  );
  const postings = useStoreValue(
    () => (userId ? recruiter.jobPostings(userId).items : []),
    [userId],
  );
  const savedSet = useStoreValue(
    () => new Set(store.getSnapshot().savedCandidates?.[userId] ?? []),
    [userId],
  );

  const base = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    return applications.filter((a) => {
      if (jobFilter !== 'all' && a.jobId !== jobFilter) return false;
      if (!needle) return true;
      const haystack = [
        a.developer?.name,
        a.developer?.headline,
        ...(a.developer?.skills ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [applications, jobFilter, searchText]);

  const counts = useMemo(() => {
    const map = { all: base.length };
    for (const a of base) map[a.status] = (map[a.status] ?? 0) + 1;
    return map;
  }, [base]);

  const rows = useMemo(
    () => (status === 'all' ? base : base.filter((a) => a.status === status)),
    [base, status],
  );

  const selected = useMemo(
    () => applications.find((a) => a.id === selectedId) ?? null,
    [applications, selectedId],
  );

  if (!isRecruiter) {
    return (
      <div>
        <PageHeader eyebrow="Recruiter workspace" title="Applicants" description="Your hiring pipeline." />
        <p className="text-sm text-[var(--color-text-secondary)]">
          The applicant pipeline is only available to recruiter accounts.
        </p>
      </div>
    );
  }

  function setParam(patch) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'all') next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  function openSheet(application) {
    setSelectedId(application.id);
    setNote('');
    setTargetStatus('');
    setScheduleDate('');
    setScheduleNote('');
  }

  const matchFor = (application) =>
    store.scoreMatchFor(application.developer?.id ?? application.userId, application.jobId);

  async function advance() {
    if (!selected || !targetStatus) return;
    setPending('status');
    const result = await applicationsApi.setStatus(selected.id, targetStatus, { note: note.trim() });
    setPending(null);
    if (result?.ok === false) {
      toast.error(result.error ?? 'The status could not be changed.');
      return;
    }
    toast.success(`${selected.developer?.name ?? 'Applicant'} → ${targetStatus.replace('-', ' ')}.`);
    setNote('');
    setTargetStatus('');
  }

  async function reject() {
    if (!selected) return;
    setPending('reject');
    const result = await applicationsApi.setStatus(selected.id, 'rejected', { note: note.trim() });
    setPending(null);
    setRejectOpen(false);
    if (result?.ok === false) {
      toast.error(result.error ?? 'The application could not be rejected.');
      return;
    }
    toast.success(`${selected.developer?.name ?? 'Applicant'} was rejected.`);
    setNote('');
  }

  async function schedule() {
    if (!selected || !scheduleDate) return;
    setPending('schedule');
    const result = await applicationsApi.scheduleInterview(selected.id, {
      scheduledFor: new Date(scheduleDate).toISOString(),
      note: scheduleNote.trim(),
    });
    setPending(null);
    if (result?.ok === false) {
      toast.error(result.error ?? 'The interview could not be scheduled.');
      return;
    }
    toast.success(`Interview scheduled for ${selected.developer?.name ?? 'the candidate'}.`);
    setScheduleOpen(false);
    setScheduleDate('');
    setScheduleNote('');
  }

  async function toggleSave() {
    if (!selected?.developer) return;
    setPending('save');
    const { saved } = await recruiter.toggleSaveCandidate(userId, selected.developer.id);
    setPending(null);
    toast.success(saved ? `Saved ${selected.developer.name} to your candidates.` : `Removed ${selected.developer.name} from saved.`);
  }

  const columns = [
    {
      key: 'developer',
      header: 'Candidate',
      first: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={row.developer?.name ?? 'Candidate'} src={row.developer?.avatar} size="sm" />
          <div className="min-w-0">
            <Link
              to={`/developers/${row.developer?.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
            >
              {row.developer?.name ?? 'Unknown'}
            </Link>
            <p className="truncate text-xs text-[var(--color-text-tertiary)]">{row.developer?.headline}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'job',
      header: 'Applied for',
      hideOnMobile: true,
      render: (row) => <span className="block max-w-[13rem] truncate">{row.job?.title ?? 'Closed posting'}</span>,
    },
    {
      key: 'match',
      header: 'Match',
      align: 'right',
      hideOnMobile: true,
      render: (row) => <MatchBadge match={matchFor(row)} />,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'appliedAt',
      header: 'Applied',
      align: 'right',
      render: (row) => <span title={formatDay(row.appliedAt)}>{formatDate(row.appliedAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Recruiter workspace"
        title="Applicants"
        description="Everyone who has applied to your postings. Select a row to review, move, reject or interview a candidate."
        actions={
          postings.length > 0 && (
            <Button to="/recruiter/jobs" variant="outline" size="sm">
              Manage postings
            </Button>
          )
        }
      />

      <SectionCard padding="none" className="overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-4 pt-1">
          <Tabs
            ariaLabel="Filter by stage"
            activeTab={status}
            onChange={(id) => setParam({ status: id === 'all' ? '' : id })}
            tabs={[
              { id: 'all', label: 'All', count: counts.all },
              ...STATUS_TABS.map((s) => ({ id: s, label: s.replace('-', ' '), count: counts[s] ?? 0 })),
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="applicants-search" className="sr-only">
              Search applicants
            </label>
            <SearchBar
              id="applicants-search"
              placeholder="Search by name or skill"
              value={searchText}
              onChange={setSearchText}
            />
          </div>
          <div className="w-full sm:w-64">
            <label htmlFor="applicants-job" className="sr-only">
              Filter by posting
            </label>
            <Select
              id="applicants-job"
              value={jobFilter}
              onChange={(e) => setParam({ job: e.target.value })}
              options={[
                { value: 'all', label: 'All postings' },
                ...postings.map((job) => ({ value: job.id, label: job.title })),
              ]}
            />
          </div>
        </div>

        <div className="p-4">
          {applications.length === 0 ? (
            <NoApplications
              role="recruiter"
              action={
                <Button to="/recruiter/jobs/new" size="sm">
                  Post a job
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <NoSearchResults
              query={searchText || status}
              action={
                <Button
                  onClick={() => {
                    setSearchText('');
                    setParam({ status: '', job: '' });
                  }}
                  size="sm"
                  variant="outline"
                >
                  Reset filters
                </Button>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              onRowClick={openSheet}
              caption="Applicants"
            />
          )}
        </div>
      </SectionCard>

      <Sheet
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        side="right"
        title={selected?.developer?.name ?? 'Applicant'}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Avatar name={selected.developer?.name ?? ''} src={selected.developer?.avatar} size="lg" />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/developers/${selected.developer?.id}`}
                  className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                >
                  {selected.developer?.name}
                </Link>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{selected.developer?.headline}</p>
                <div className="mt-2">
                  <MatchBadge match={matchFor(selected)} />
                </div>
              </div>
            </div>

            <DetailList
              columns={2}
              dense
              items={[
                { label: 'Posting', value: selected.job?.title ?? 'Closed posting' },
                { label: 'Stage', value: <StatusBadge status={selected.status} /> },
                { label: 'Applied', value: formatDay(selected.appliedAt) },
                { label: 'Last update', value: timeAgo(selected.updatedAt) },
              ]}
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                Cover note
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {selected.coverNote || 'The applicant did not include a note.'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">Skills</p>
              <SkillList skills={selected.developer?.skills ?? []} max={12} className="mt-1.5" emptyLabel="No skills listed" />
            </div>

            {selected.interview?.scheduledFor && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  Interview
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                  {formatDay(selected.interview.scheduledFor, { withTime: true })}
                </p>
                {selected.interview.note && (
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{selected.interview.note}</p>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                Status history
              </p>
              <Timeline entries={selected.timeline ?? []} />
            </div>

            <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
              <TextAreaField
                label="Note (optional)"
                rows={2}
                placeholder="Why this decision — the applicant is notified with it."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Select
                    aria-label="Move to stage"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    options={[
                      { value: '', label: 'Choose a stage…', disabled: true },
                      ...ADVANCE_TARGETS.filter((s) => s !== selected.status).map((s) => ({
                        value: s,
                        label: s.replace('-', ' '),
                      })),
                    ]}
                  />
                </div>
                <Button onClick={advance} disabled={!targetStatus || pending !== null} loading={pending === 'status'}>
                  Move
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  icon={CalendarPlus}
                  onClick={() => setScheduleOpen(true)}
                  disabled={pending !== null}
                >
                  Schedule interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectOpen(true)}
                  disabled={selected.status === 'rejected' || pending !== null}
                >
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  icon={savedSet.has(selected.developer?.id) ? BookmarkX : Bookmark}
                  onClick={toggleSave}
                  disabled={pending !== null}
                  loading={pending === 'save'}
                >
                  {savedSet.has(selected.developer?.id) ? 'Unsave' : 'Save candidate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>

      <Modal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title={`Schedule an interview with ${selected?.developer?.name ?? ''}`}
      >
        <div className="space-y-4">
          <Field label="When" htmlFor="schedule-date">
            <TextInput
              id="schedule-date"
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </Field>
          <TextAreaField
            label="Note (optional)"
            rows={3}
            placeholder="Panel, format, who they will meet."
            value={scheduleNote}
            onChange={(e) => setScheduleNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setScheduleOpen(false)} disabled={pending === 'schedule'}>
              Cancel
            </Button>
            <Button size="sm" onClick={schedule} disabled={!scheduleDate || pending !== null} loading={pending === 'schedule'}>
              Confirm interview
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={reject}
        loading={pending === 'reject'}
        danger
        title="Reject this applicant?"
        confirmLabel="Reject candidate"
        description={
          selected
            ? `${selected.developer?.name ?? 'The applicant'} will be told their application for “${selected.job?.title ?? 'this role'}” was not advanced. Their timeline and notes stay on file.`
            : ''
        }
      />
    </div>
  );
}

export default RecruiterApplicants;
