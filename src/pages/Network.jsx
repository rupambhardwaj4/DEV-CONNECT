import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ban,
  Check,
  Clock,
  MapPin,
  MessageSquare,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context';
import { store, useStore } from '../hooks/useStore';
import { connections, developers } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Card, SectionCard } from '../components/common/Card';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Avatar } from '../components/common/Avatar';
import { Badge, ConnectionStateBadge } from '../components/common/Badge';
import { SkillList, Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { Menu } from '../components/common/Menu';
import { ConnectionTable } from '../components/common/Table';
import { EmptyState, NoConnections } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FilterPanel, FilterChips } from '../components/common/FilterPanel';
import { SelectField, TextAreaField, TextField } from '../components/common/Field';
import { Pagination, ResultsCount } from '../components/common/Pagination';
import { SearchBar } from '../components/common/SearchBar';
import { useToast } from '../components/common/Toast';
import { pluralize, timeAgo } from '../utils/format';

const OPEN_TO_LABELS = {
  'new-roles': 'Open to new roles',
  'leadership-roles': 'Open to leadership',
  'contract-work': 'Open to contract work',
  'first-roles': 'Looking for first role',
  advisory: 'Open to advisory',
  'not-looking': 'Not looking',
};

const EXPERIENCE_ORDER = ['junior', 'mid', 'senior', 'lead', 'principal'];
const PER_PAGE = 6;

function openToLabel(value) {
  return OPEN_TO_LABELS[value] ?? value ?? 'No preference set';
}

function openToTone(value) {
  if (value === 'not-looking') return 'neutral';
  if (value === 'advisory') return 'info';
  if (value === 'first-roles') return 'warning';
  return 'success';
}

export function Network() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const snapshot = useStore();

  const [tab, setTab] = useState('discover');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [levels, setLevels] = useState([]);
  const [openTo, setOpenTo] = useState('');
  const [sort, setSort] = useState('suggested');
  const [page, setPage] = useState(1);

  const [pending, setPending] = useState({});
  const [messageFor, setMessageFor] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [removeFor, setRemoveFor] = useState(null);

  const data = useMemo(() => {
    if (!user) return null;
    const incoming = store.getPendingRequests(user.id);
    const outgoing = store.getSentRequests(user.id);
    const rows = store.getConnections(user.id);

    const incomingByUser = new Map(incoming.map((r) => [r.fromUserId, r.id]));
    const outgoingByUser = new Map(outgoing.map((r) => [r.toUserId, r.id]));

    const suggestions = developers.suggestions(user.id, 6);

    // Facets are read from the whole developer pool so no filter option is ever dead.
    const pool = store.queryDevelopers({ perPage: 999, page: 1 }).items;
    const skillSet = new Set();
    const levelSet = new Set();
    const openToSet = new Set();
    for (const dev of pool) {
      for (const s of dev.skills ?? []) skillSet.add(s);
      if (dev.experienceLevel) levelSet.add(dev.experienceLevel);
      if (dev.openTo) openToSet.add(dev.openTo);
    }

    return {
      incoming,
      outgoing,
      rows,
      suggestions,
      incomingByUser,
      outgoingByUser,
      skillFacets: [...skillSet].sort(),
      levelFacets: EXPERIENCE_ORDER.filter((l) => levelSet.has(l)),
      openToFacets: [...openToSet],
    };
    // `snapshot` is a dependency so this memo recomputes after any store mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, snapshot]);

  if (!user || !data) return null;

  const viewerSkills = user.skills ?? [];
  const viewerSkillSet = new Set(viewerSkills.map((s) => s.toLowerCase()));

  const filtered = developers.query({
    query: search.trim(),
    skills,
    experienceLevel: levels,
    openTo,
    location: location.trim(),
    excludeConnectedFor: user.id,
    page: 1,
    perPage: 999,
  });

  const discoverItems = [...filtered.items];
  if (sort === 'name') {
    discoverItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'experience') {
    discoverItems.sort(
      (a, b) => (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0) || a.name.localeCompare(b.name),
    );
  } else {
    discoverItems.sort(
      (a, b) =>
        b.mutualConnections - a.mutualConnections ||
        b.sharedSkills.length - a.sharedSkills.length ||
        a.name.localeCompare(b.name),
    );
  }

  const totalPages = Math.max(1, Math.ceil(discoverItems.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = discoverItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const filtersActive = skills.length + levels.length + (openTo ? 1 : 0) + (location.trim() ? 1 : 0);

  const chips = [
    ...skills.map((s) => ({ name: 'skill', value: s, label: s })),
    ...levels.map((l) => ({ name: 'level', value: l, label: `${l} experience` })),
    ...(openTo ? [{ name: 'openTo', value: openTo, label: openToLabel(openTo) }] : []),
    ...(location.trim() ? [{ name: 'location', value: location, label: `Near ${location.trim()}` }] : []),
  ];

  function clearFilters() {
    setSkills([]);
    setLevels([]);
    setOpenTo('');
    setLocation('');
    setPage(1);
  }

  function removeChip(chip) {
    if (chip.name === 'skill') setSkills((prev) => prev.filter((s) => s !== chip.value));
    else if (chip.name === 'level') setLevels((prev) => prev.filter((l) => l !== chip.value));
    else if (chip.name === 'openTo') setOpenTo('');
    else if (chip.name === 'location') setLocation('');
    setPage(1);
  }

  const filterGroups = [
    {
      name: 'skills',
      label: 'Skills',
      type: 'checkbox',
      value: skills,
      options: data.skillFacets.map((s) => ({ value: s, label: s })),
    },
    {
      name: 'levels',
      label: 'Experience level',
      type: 'checkbox',
      value: levels,
      options: data.levelFacets.map((l) => ({ value: l, label: l })),
    },
    {
      name: 'openTo',
      label: 'Open to',
      type: 'radio',
      value: openTo,
      options: data.openToFacets.map((o) => ({ value: o, label: openToLabel(o) })),
    },
  ];

  async function runAction(key, kind, fn, successMsg) {
    setPending((p) => ({ ...p, [key]: kind }));
    try {
      const result = await fn();
      if (result && result.ok === false) toast.error(result.error ?? 'That did not work.');
      else if (result && result.state === 'incoming' && result.error) toast.info(result.error);
      else if (successMsg) toast.success(successMsg);
      return result;
    } catch {
      toast.error('Something went wrong. Try again.');
      return null;
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }

  function sendRequest(dev) {
    return runAction(dev.id, 'send', () => connections.send(user.id, dev.id), `Request sent to ${dev.name}.`);
  }

  function cancelOutgoing(dev) {
    const id = data.outgoingByUser.get(dev.id);
    if (!id) return null;
    return runAction(dev.id, 'withdraw', () => connections.withdrawSent(id), `Request to ${dev.name} withdrawn.`);
  }

  function acceptIncoming(dev) {
    const id = data.incomingByUser.get(dev.id);
    if (!id) return null;
    return runAction(dev.id, 'respond', () => connections.respond(id, true), `You are connected with ${dev.name}.`);
  }

  async function respondFromRow(request, accept) {
    await runAction(
      request.id,
      accept ? 'respond' : 'decline',
      () => connections.respond(request.id, accept),
      accept ? `You are connected with ${request.user.name}.` : `Declined ${request.user.name}'s request.`,
    );
  }

  async function withdrawFromRow(request) {
    await runAction(
      request.id,
      'withdraw',
      () => connections.withdrawSent(request.id),
      `Withdrawn your request to ${request.user.name}.`,
    );
  }

  async function confirmRemove() {
    if (!removeFor) return;
    const dev = removeFor;
    setPending((p) => ({ ...p, [dev.otherId]: 'remove' }));
    const result = await connections.remove(user.id, dev.otherId);
    setPending((p) => {
      const next = { ...p };
      delete next[dev.otherId];
      return next;
    });
    if (result && result.ok === false) toast.error(result.error);
    else toast.success(`Removed ${dev.user.name} from your connections.`);
    setRemoveFor(null);
  }

  function openMessage(dev) {
    setMessageFor(dev);
    setMessageDraft('');
    toast.info(`Direct messaging with ${dev.user?.name ?? dev.name} is coming soon.`);
  }

  function connectionButton(dev, size = 'sm') {
    const state = store.getConnectionState(user.id, dev.id);
    const busy = pending[dev.id];
    if (state === 'connected') {
      return (
        <Button variant="outline" size={size} disabled>
          Connected
        </Button>
      );
    }
    if (state === 'outgoing') {
      return (
        <Button
          variant="outline"
          size={size}
          icon={Ban}
          loading={busy === 'withdraw'}
          disabled={Boolean(busy)}
          onClick={() => cancelOutgoing(dev)}
        >
          Requested · Cancel
        </Button>
      );
    }
    if (state === 'incoming') {
      return (
        <Button
          size={size}
          icon={Check}
          loading={busy === 'respond'}
          disabled={Boolean(busy)}
          onClick={() => acceptIncoming(dev)}
        >
          Accept
        </Button>
      );
    }
    return (
      <Button
        size={size}
        icon={UserPlus}
        loading={busy === 'send'}
        disabled={Boolean(busy)}
        onClick={() => sendRequest(dev)}
      >
        Connect
      </Button>
    );
  }

  const tabs = [
    { value: 'discover', label: 'Discover' },
    { value: 'requests', label: 'Requests', count: data.incoming.length + data.outgoing.length },
    { value: 'connections', label: 'Connections', count: data.rows.length },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Developer network"
        title="Grow your network"
        description="Find engineers by skill and availability, handle incoming requests, and keep your connections in order."
      />

      <SegmentedControl
        options={tabs}
        value={tab}
        onChange={setTab}
        ariaLabel="Network sections"
        className="mb-4"
      />

      {tab === 'discover' && (
        <div className="space-y-4">
          {!filtersActive && !search.trim() && data.suggestions.length > 0 && (
            <SectionCard
              title="Suggested for you"
              description="Ranked on shared skills and mutual connections."
            >
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.suggestions.map((dev) => (
                  <li key={dev.id}>
                    <SuggestionRow
                      dev={dev}
                      viewerSkillSet={viewerSkillSet}
                      action={connectionButton(dev)}
                    />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <div className="lg:flex lg:items-start lg:gap-5">
            <FilterPanel
              groups={filterGroups}
              onChange={(patch) => {
                setPage(1);
                if (patch.skills) setSkills(patch.skills);
                if (patch.levels) setLevels(patch.levels);
                if (patch.openTo !== undefined) setOpenTo(patch.openTo);
              }}
              onClear={clearFilters}
              activeCount={filtersActive}
              resultLabel={`${discoverItems.length} ${discoverItems.length === 1 ? 'developer' : 'developers'}`}
            />

            <div className="min-w-0 flex-1">
              <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_11rem]">
                <SearchBar
                  placeholder="Search by name, headline, bio or skill"
                  value={search}
                  onChange={(v) => {
                    setSearch(v);
                    setPage(1);
                  }}
                  onClear={() => setPage(1)}
                />
                <SelectField
                  label="Sort by"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  options={[
                    { value: 'suggested', label: 'Suggested first' },
                    { value: 'name', label: 'Name (A–Z)' },
                    { value: 'experience', label: 'Most experienced' },
                  ]}
                />
              </div>

              <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <TextField
                  label="Location"
                  placeholder="e.g. Remote (EU), Berlin"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setPage(1);
                  }}
                />
                <ResultsCount
                  total={discoverItems.length}
                  shown={paged.length}
                  noun="developers"
                  singular="developer"
                  query={search.trim() || undefined}
                  className="pb-2"
                />
              </div>

              <FilterChips chips={chips} onRemove={removeChip} onClear={clearFilters} className="mb-4" />

              {paged.length === 0 ? (
                <Card>
                  {filtersActive || search.trim() || location.trim() ? (
                    <EmptyState
                      icon="search"
                      title="No developers match these filters"
                      description="Every filter has to match at once, so a rare skill plus a location narrows fast. Remove one filter and search a shorter phrase."
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            clearFilters();
                            setSearch('');
                          }}
                        >
                          Clear filters
                        </Button>
                      }
                      compact
                    />
                  ) : (
                    <EmptyState
                      icon="users"
                      title="No developers to discover yet"
                      description="You're already connected with everyone here. Manage your network from the Connections tab."
                      action={
                        <Button variant="outline" size="sm" onClick={() => setTab('connections')}>
                          View connections
                        </Button>
                      }
                      compact
                    />
                  )}
                </Card>
              ) : (
                <>
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {paged.map((dev) => (
                      <li key={dev.id}>
                        <DeveloperCard
                          dev={dev}
                          viewerId={user.id}
                          viewerSkillSet={viewerSkillSet}
                          action={connectionButton(dev)}
                        />
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="mt-5"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Incoming requests" description="People who asked to connect with you.">
            {data.incoming.length === 0 ? (
              <EmptyState
                icon="users"
                title="No pending requests"
                description="When someone asks to connect, their request lands here with an Accept and Decline action."
                action={
                  <Button variant="outline" size="sm" onClick={() => setTab('discover')}>
                    Discover developers
                  </Button>
                }
                compact
              />
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {data.incoming.map((request) => {
                  const busy = pending[request.id];
                  return (
                    <li key={request.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <Avatar name={request.user.name} src={request.user.avatar} size="md" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/developers/${request.user.id}`}
                          className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                        >
                          {request.user.name}
                        </Link>
                        <p className="truncate text-xs text-[var(--color-text-secondary)]">
                          {request.user.headline}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                          {timeAgo(request.requestedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="xs"
                          icon={Check}
                          loading={busy === 'respond'}
                          disabled={Boolean(busy)}
                          onClick={() => respondFromRow(request, true)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          icon={X}
                          loading={busy === 'decline'}
                          disabled={Boolean(busy)}
                          onClick={() => respondFromRow(request, false)}
                        >
                          Decline
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Sent requests" description="Requests you have sent and are waiting on.">
            {data.outgoing.length === 0 ? (
              <EmptyState
                icon="users"
                title="You have no requests waiting"
                description="Requests you send from Discover appear here until the person responds. You can withdraw any of them."
                action={
                  <Button variant="outline" size="sm" onClick={() => setTab('discover')}>
                    Find someone
                  </Button>
                }
                compact
              />
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {data.outgoing.map((request) => {
                  const busy = pending[request.id];
                  return (
                    <li key={request.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <Avatar name={request.user.name} src={request.user.avatar} size="md" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/developers/${request.user.id}`}
                          className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                        >
                          {request.user.name}
                        </Link>
                        <p className="truncate text-xs text-[var(--color-text-secondary)]">
                          {request.user.headline}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                          <Clock className="h-3 w-3" aria-hidden /> Sent {timeAgo(request.requestedAt)}
                        </p>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        icon={Ban}
                        loading={busy === 'withdraw'}
                        disabled={Boolean(busy)}
                        onClick={() => withdrawFromRow(request)}
                      >
                        Withdraw
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'connections' && (
        <SectionCard
          title="Your connections"
          description="Two-way relationships. Remove one and they move back to Discover."
        >
          {data.rows.length === 0 ? (
            <NoConnections
              action={
                <Button size="sm" onClick={() => setTab('discover')}>
                  Start discovering people
                </Button>
              }
            />
          ) : (
            <ConnectionTable
              rows={data.rows.map((row) => ({
                ...row,
                state: store.getConnectionState(user.id, row.otherId),
              }))}
              onSelect={(row) => navigate(`/developers/${row.otherId}`)}
              actions={(row) => (
                <Menu
                  label={`Actions for ${row.user.name}`}
                  items={[
                    {
                      id: 'view',
                      label: 'View profile',
                      onSelect: () => navigate(`/developers/${row.otherId}`),
                    },
                    {
                      id: 'message',
                      label: 'Message',
                      icon: MessageSquare,
                      onSelect: () => openMessage(row),
                    },
                    { separator: true },
                    {
                      id: 'remove',
                      label: 'Remove connection',
                      icon: Trash2,
                      danger: true,
                      onSelect: () => setRemoveFor(row),
                    },
                  ]}
                />
              )}
            />
          )}
        </SectionCard>
      )}

      <Modal
        isOpen={Boolean(messageFor)}
        onClose={() => setMessageFor(null)}
        title={messageFor ? `Message ${messageFor.user.name}` : ''}
      >
        {messageFor && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Direct messaging is on the way. For now, reach out by sending a connection request with a note.
            </p>
            <TextAreaField
              label={`Note for ${messageFor.user.name}`}
              rows={4}
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              placeholder="Draft a short intro you would send after connecting."
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setMessageFor(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(removeFor)}
        onClose={() => setRemoveFor(null)}
        onConfirm={confirmRemove}
        title="Remove this connection?"
        description={
          removeFor
            ? `${removeFor.user.name} will be removed from your connections. They won't be notified, and you can send a new request from Discover any time.`
            : ''
        }
        confirmLabel="Remove connection"
        danger
        loading={Boolean(removeFor && pending[removeFor.otherId] === 'remove')}
      />
    </div>
  );
}

function DeveloperCard({ dev, viewerId, viewerSkillSet, action }) {
  const state = store.getConnectionState(viewerId, dev.id);
  const shared = (dev.skills ?? []).filter((s) => viewerSkillSet.has(s.toLowerCase()));

  return (
    <Card hover className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <Avatar name={dev.name} src={dev.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/developers/${dev.id}`}
            className="block truncate text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
          >
            {dev.name}
          </Link>
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">{dev.headline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        {dev.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden /> {dev.location}
          </span>
        )}
        <Badge tone="neutral">{dev.experienceLevel}</Badge>
        <Badge tone={openToTone(dev.openTo)}>{openToLabel(dev.openTo)}</Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {dev.bio}
      </p>

      <SkillList
        skills={dev.skills ?? []}
        matched={shared}
        max={5}
        className="mt-3"
      />

      <div className="mt-3 flex flex-1 items-end justify-between gap-2 border-t border-[var(--color-border)] pt-3">
        <div className="min-w-0 text-xs text-[var(--color-text-tertiary)]">
          <ConnectionStateBadge state={state} className="mb-1.5" />
          {dev.mutualConnections > 0 ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden /> {pluralize(dev.mutualConnections, 'mutual connection')}
            </span>
          ) : (
            <span>No shared connections</span>
          )}
        </div>
        {action}
      </div>
    </Card>
  );
}

function SuggestionRow({ dev, viewerSkillSet, action }) {
  const shared = dev.sharedSkills?.length
    ? dev.sharedSkills
    : (dev.skills ?? []).filter((s) => viewerSkillSet.has(s.toLowerCase()));

  return (
    <div className="flex h-full items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <Avatar name={dev.name} src={dev.avatar} size="md" />
      <div className="min-w-0 flex-1">
        <Link
          to={`/developers/${dev.id}`}
          className="block truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
        >
          {dev.name}
        </Link>
        <p className="truncate text-xs text-[var(--color-text-secondary)]">{dev.headline}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {shared.slice(0, 3).map((skill) => (
            <Tag key={skill} variant="matched">
              {skill}
            </Tag>
          ))}
          {!shared.length && (
            <span className="text-xs text-[var(--color-text-tertiary)]">No skills in common</span>
          )}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export default Network;
