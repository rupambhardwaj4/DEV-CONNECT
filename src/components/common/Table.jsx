import { cn } from '../../utils/cn';
import { Avatar } from './Avatar';
import { ConnectionStateBadge, StatusBadge } from './Badge';
import { formatDate, formatDay } from '../../utils/format.js';

/**
 * Responsive table. Real <table> semantics from 768px up; stacked cards below that,
 * because a horizontally scrolling applicant pipeline on a phone is not a plan.
 *
 * Column shape: { key, header, render?, className?, headerClassName?, align?, hideBelow? }
 */
export function Table({
  columns,
  rows,
  rowKey = (row, index) => row.id ?? index,
  onRowClick,
  emptyState,
  loading = false,
  skeletonRows = 5,
  className = '',
  caption,
}) {
  if (loading) {
    return (
      <div className={cn('divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]', className)}>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            {columns.map((col) => (
              <div key={col.key} className="h-4 flex-1 animate-shimmer rounded bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return emptyState ?? null;
  }

  const interactive = Boolean(onRowClick);

  return (
    <>
      {/* Mobile: one card per row, label/value pairs */}
      <ul className={cn('space-y-3 md:hidden', className)}>
        {rows.map((row, index) => (
          <li
            key={rowKey(row, index)}
            onClick={interactive ? () => onRowClick(row) : undefined}
            className={cn(
              'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
              interactive && 'cursor-pointer transition-colors active:bg-[var(--color-surface-alt)]',
            )}
          >
            <div className="space-y-2.5">
              {columns
                .filter((col) => !col.hideOnMobile && !col.action)
                .map((col, colIndex) => (
                  <div
                    key={col.key}
                    className={cn(
                      'flex items-start justify-between gap-4',
                      colIndex === 0 && 'pb-2',
                    )}
                  >
                    <dt
                      className={cn(
                        'shrink-0 text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]',
                        colIndex === 0 && 'text-sm font-semibold normal-case tracking-normal text-[var(--color-text-primary)]',
                      )}
                    >
                      {col.header}
                    </dt>
                    <dd className="min-w-0 text-right text-sm text-[var(--color-text-secondary)]">
                      {col.render ? col.render(row, index) : row[col.key]}
                    </dd>
                  </div>
                ))}
              {columns
                .filter((col) => col.action)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex justify-end pt-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {col.render(row, index)}
                  </div>
                ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className={cn('hidden overflow-x-auto md:block', className)}>
        <table className="w-full border-collapse text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]',
                    col.align === 'right' && 'text-right',
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={interactive ? () => onRowClick(row) : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  'border-b border-[var(--color-border)] last:border-0 transition-colors',
                  interactive
                    ? 'cursor-pointer hover:bg-[var(--color-surface-alt)] focus-visible:bg-[var(--color-surface-alt)] focus-visible:outline-none'
                    : 'hover:bg-[color-mix(in_srgb,var(--color-surface-alt)_50%,transparent)]',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-3 align-middle text-[var(--color-text-secondary)]',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.first && 'font-medium text-[var(--color-text-primary)]',
                      col.className,
                    )}
                    onClick={col.action ? (event) => event.stopPropagation() : undefined}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function TableHead({ children, className }) {
  return (
    <th scope="col" className={cn('whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]', className)}>
      {children}
    </th>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr className={cn('border-b border-[var(--color-border)] last:border-0', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-3 py-3 align-middle text-sm text-[var(--color-text-secondary)]', className)} {...props}>
      {children}
    </td>
  );
}

/* ── Domain tables ───────────────────────────────────────────────────────────
 * Thin column configs over the generic Table so the recruiter pipeline, the
 * postings list and the connections list share one responsive behaviour.
 * ────────────────────────────────────────────────────────────────────────── */

function PersonCell({ name, secondary, src }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar name={name} src={src} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
        {secondary && <p className="truncate text-xs text-[var(--color-text-tertiary)]">{secondary}</p>}
      </div>
    </div>
  );
}

/** Recruiter pipeline: one row per application. */
export function ApplicantTable({
  applications = [],
  onSelect,
  actions,
  loading = false,
  emptyState,
  className = '',
}) {
  const columns = [
    {
      key: 'developer',
      header: 'Candidate',
      first: true,
      render: (row) => (
        <PersonCell
          name={row.developer?.name ?? 'Unknown'}
          secondary={row.developer?.headline}
          src={row.developer?.avatar}
        />
      ),
    },
    {
      key: 'job',
      header: 'Applied for',
      hideOnMobile: true,
      render: (row) => <span className="block max-w-[14rem] truncate">{row.job?.title ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'appliedAt',
      header: 'Applied',
      align: 'right',
      hideOnMobile: true,
      render: (row) => <span title={formatDay(row.appliedAt)}>{formatDate(row.appliedAt)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      align: 'right',
      render: (row) => <span title={formatDay(row.updatedAt)}>{formatDate(row.updatedAt)}</span>,
    },
  ];

  if (actions) {
    columns.push({
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      action: true,
      align: 'right',
      headerClassName: 'w-10',
      render: (row, index) => actions(row, index),
    });
  }

  return (
    <Table
      columns={columns}
      rows={applications}
      rowKey={(row) => row.id}
      onRowClick={onSelect}
      loading={loading}
      emptyState={emptyState}
      className={className}
      caption="Applications"
    />
  );
}

/** Recruiter postings list. */
export function JobTable({
  jobs = [],
  onSelect,
  actions,
  showApplicants = true,
  loading = false,
  emptyState,
  className = '',
}) {
  const columns = [
    {
      key: 'title',
      header: 'Posting',
      first: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{row.title}</p>
          <p className="truncate text-xs text-[var(--color-text-tertiary)]">
            {row.company?.name ?? '—'} · {row.location}
          </p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} kind="job" /> },
    {
      key: 'postedAt',
      header: 'Posted',
      hideOnMobile: true,
      render: (row) => <span title={formatDay(row.postedAt)}>{formatDate(row.postedAt)}</span>,
    },
  ];

  if (showApplicants) {
    columns.push({
      key: 'applicantCount',
      header: 'Applicants',
      align: 'right',
      render: (row) => <span className="tabular-nums">{row.applicantCount ?? 0}</span>,
    });
  }

  if (actions) {
    columns.push({
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      action: true,
      align: 'right',
      headerClassName: 'w-10',
      render: (row, index) => actions(row, index),
    });
  }

  return (
    <Table
      columns={columns}
      rows={jobs}
      rowKey={(row) => row.id}
      onRowClick={onSelect}
      loading={loading}
      emptyState={emptyState}
      className={className}
      caption="Job postings"
    />
  );
}

/** Connections / pending requests list, used on both sides of a relationship. */
export function ConnectionTable({
  rows = [],
  onSelect,
  actions,
  dateLabel = 'Connected',
  loading = false,
  emptyState,
  className = '',
}) {
  const columns = [
    {
      key: 'user',
      header: 'Person',
      first: true,
      render: (row) => (
        <PersonCell
          name={row.user?.name ?? 'Unknown'}
          secondary={row.user?.headline ?? row.user?.title}
          src={row.user?.avatar}
        />
      ),
    },
    {
      key: 'state',
      header: 'State',
      render: (row) => <ConnectionStateBadge state={row.state ?? row.connectionState} />,
    },
    {
      key: 'requestedAt',
      header: dateLabel,
      align: 'right',
      hideOnMobile: true,
      render: (row) => (
        <span title={formatDay(row.respondedAt ?? row.requestedAt)}>
          {formatDate(row.respondedAt ?? row.requestedAt)}
        </span>
      ),
    },
  ];

  if (actions) {
    columns.push({
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      action: true,
      align: 'right',
      headerClassName: 'w-10',
      render: (row, index) => actions(row, index),
    });
  }

  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      onRowClick={onSelect}
      loading={loading}
      emptyState={emptyState}
      className={className}
      caption="Connections"
    />
  );
}
