import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Pencil,
  Plus,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context';
import { developers, jobs } from '../services/api';
import { MATCH_WEIGHTS } from '../lib/matching';
import { hasSkill, normalizeSkill } from '../lib/skills';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard, EmptyRow } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { Tag } from '../components/common/Tag';
import {
  Field,
  FieldGroup,
  TextField,
  TextAreaField,
  SelectField,
  TextInput,
  ValidationError,
} from '../components/common/Field';
import { CheckboxRow, Toggle } from '../components/common/Toggle';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';

const MAX_SKILLS = 25;

const LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'principal', label: 'Principal' },
];

const OPEN_TO_OPTIONS = [
  { value: 'new-roles', label: 'Open to new roles' },
  { value: 'first-roles', label: 'Looking for a first role' },
  { value: 'leadership-roles', label: 'Open to leadership roles' },
  { value: 'contract-work', label: 'Open to contract work' },
  { value: 'advisory', label: 'Open to advisory work' },
  { value: 'collaboration', label: 'Open to collaboration' },
  { value: 'not-looking', label: 'Not looking right now' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'connections', label: 'Connections only' },
  { value: 'private', label: 'Private' },
];

const WORK_MODES = [
  { value: 'any', label: 'Any' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const ROLE_TYPES = ['full-time', 'part-time', 'contract', 'internship'];

const CAREER_COPY = {
  experience: {
    heading: 'Experience',
    blurb: 'Roles in order, most recent first. One line on what you owned beats a list of duties.',
    addLabel: 'Add a role',
    itemLabel: 'role',
    title: 'Role',
    titleHint: 'As the posting named it, e.g. Senior Backend Engineer.',
    organization: 'Company',
    organizationHint: 'Employer, client or "Independent consulting".',
    detail: 'What you owned',
    detailHint: 'Scope plus one measurable result if you have one.',
  },
  education: {
    heading: 'Education',
    blurb: 'Degrees, diplomas and the course you actually learned the trade on.',
    addLabel: 'Add education',
    itemLabel: 'entry',
    title: 'Qualification',
    titleHint: 'e.g. BSc Computer Science, or Full-stack Bootcamp.',
    organization: 'Institution',
    organizationHint: 'School, university or provider.',
    detail: 'Notes (optional)',
    detailHint: 'Thesis, focus area, or nothing at all.',
  },
};

export function ProfileEdit() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [base, setBase] = useState(() => JSON.stringify(buildForm(user)));
  const [form, setForm] = useState(() => buildForm(user));
  const [skillDraft, setSkillDraft] = useState('');
  const [skillMessage, setSkillMessage] = useState(null);
  const [locationDraft, setLocationDraft] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [careerModal, setCareerModal] = useState(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const serialized = JSON.stringify(form);
  const dirty = serialized !== base;
  const hasErrors = Object.keys(errors).length > 0;

  const facets = useMemo(() => jobs.facets(), []);
  const suggestedSkills = useMemo(
    () =>
      (facets.skills ?? [])
        .filter((skill) => !hasSkill(form.skills, skill))
        .slice(0, 14),
    [facets.skills, form.skills],
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  if (!user) return null;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setPreference(key, value) {
    setForm((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
  }

  function errorFor(key) {
    return attempted ? errors[key] : undefined;
  }

  function addSkill(raw) {
    const value = String(raw ?? '').trim();
    if (!value) return;
    if (form.skills.length >= MAX_SKILLS) {
      setSkillMessage(`List is at the ${MAX_SKILLS}-skill cap. Remove one before adding another.`);
      return;
    }
    const canonical = normalizeSkill(value);
    if (hasSkill(form.skills, canonical)) {
      setSkillMessage(`${canonical} is already on the list — matching ignores case and aliases.`);
      return;
    }
    setForm((prev) => ({ ...prev, skills: [...prev.skills, canonical] }));
    setSkillDraft('');
    setSkillMessage(`${canonical} added.`);
  }

  function removeSkill(skill) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item.toLowerCase() !== skill.toLowerCase()),
    }));
    setSkillMessage(null);
  }

  function addLocation() {
    const value = locationDraft.trim();
    if (!value) return;
    if (form.preferences.locations.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setLocationDraft('');
      return;
    }
    setPreference('locations', [...form.preferences.locations, value]);
    setLocationDraft('');
  }

  function saveCareer(entry) {
    setForm((prev) => {
      const key = careerModal.kind;
      const list = [...prev[key]];
      if (careerModal.index === null) list.push(entry);
      else list[careerModal.index] = entry;
      return { ...prev, [key]: list };
    });
    setCareerModal(null);
  }

  function removeCareer(kind, index) {
    setForm((prev) => ({ ...prev, [kind]: prev[kind].filter((_, i) => i !== index) }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setAttempted(true);
    if (hasErrors) {
      toast.error('Nothing was saved.', {
        message: `${Object.keys(errors).length} field${Object.keys(errors).length === 1 ? '' : 's'} need attention before the store will take this.`,
      });
      return;
    }
    const patch = buildPatch(form, JSON.parse(base));
    if (Object.keys(patch).length === 0) {
      toast.info('No changes to save.');
      return;
    }
    setSaving(true);
    const result = await developers.update(user.id, patch);
    setSaving(false);

    if (!result || result.error) {
      toast.error(result?.error ?? 'The store refused the change.', {
        title: 'Save failed',
      });
      return;
    }

    const nextForm = buildForm(result);
    setForm(nextForm);
    setBase(JSON.stringify(nextForm));
    setSkillMessage(null);
    toast.success('Saved to this browser.', {
      message: `${Object.keys(patch).length} field${Object.keys(patch).length === 1 ? '' : 's'} saved to your profile.`,
    });
  }

  function leaveWithoutSaving() {
    setDiscardOpen(false);
    navigate('/profile');
  }

  function handleCancel() {
    if (dirty) setDiscardOpen(true);
    else navigate('/profile');
  }

  return (
    <form onSubmit={handleSave} noValidate>
      <PageHeader
        eyebrow="Edit profile"
        title="Your profile, field by field"
        description="Changes are saved straight to your profile and update every screen that reads it."
        back={dirty ? undefined : { to: '/profile', label: 'Back to profile' }}
        actions={
          <>
            {dirty && (
              <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={handleCancel}>
                Back to profile
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!dirty || saving} icon={Save}>
              {saving ? 'Saving' : 'Save changes'}
            </Button>
          </>
        }
      />

      {dirty && (
        <p
          role="status"
          className="mb-4 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
        >
          Unsaved changes. {hasErrors && attempted ? 'Some fields still need fixing.' : ''}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <SectionCard
            title="Basics"
            description="Name, headline and links — the parts a recruiter reads before anything else."
          >
            <FieldGroup>
              <TextField
                label="Full name"
                required
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                error={errorFor('name')}
                hint={`${form.name.trim().length}/60`}
                autoComplete="name"
              />
              <TextField
                label="Location"
                required
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                error={errorFor('location')}
                hint="City and country, as you would want it shown in search."
                placeholder="Bengaluru, India"
              />
            </FieldGroup>

            <TextField
              className="mt-4"
              label="Headline"
              required
              value={form.headline}
              onChange={(event) => setField('headline', event.target.value)}
              error={errorFor('headline')}
              hint={`${form.headline.trim().length}/110 — role plus the two or three technologies you are known for.`}
              placeholder="Senior full-stack engineer · TypeScript, React, Node.js"
            />

            <TextAreaField
              className="mt-4"
              label="Summary"
              required
              rows={5}
              value={form.bio}
              onChange={(event) => setField('bio', event.target.value)}
              error={errorFor('bio')}
              hint={`${form.bio.trim().length} characters. The store accepts up to 4000 and strips any markup.`}
            />

            <FieldGroup className="mt-4">
              <SelectField
                label="Experience level"
                options={LEVEL_OPTIONS}
                value={form.experienceLevel}
                onChange={(event) => setField('experienceLevel', event.target.value)}
                hint="Compared against each posting's level — worth part of your match score."
              />
              <SelectField
                label="Open to"
                options={OPEN_TO_OPTIONS}
                value={form.openTo}
                onChange={(event) => setField('openTo', event.target.value)}
                hint="Shown on your profile header and used as a filter by people searching developers."
              />
            </FieldGroup>

            <div className="mt-4">
              <SelectField
                label="Profile visibility"
                className="max-w-sm"
                options={VISIBILITY_OPTIONS}
                value={form.visibility}
                onChange={(event) => setField('visibility', event.target.value)}
                hint="Stored and displayed on your profile. Developer search does not filter on this yet, so don't treat it as a lock."
              />
            </div>

            <FieldGroup className="mt-4" orientation="stack">
              <TextField
                label="Website"
                value={form.website}
                onChange={(event) => setField('website', event.target.value)}
                error={errorFor('website')}
                hint="Full URL with the scheme: https://your-name.dev"
                placeholder="https://"
                inputMode="url"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="LinkedIn handle"
                  value={form.linkedIn}
                  onChange={(event) => setField('linkedIn', event.target.value)}
                  error={errorFor('linkedIn')}
                  hint="Handle only, no domain: in/priyaraman"
                />
                <TextField
                  label="GitHub username"
                  value={form.githubUsername}
                  onChange={(event) => setField('githubUsername', event.target.value)}
                  error={errorFor('githubUsername')}
                  hint="Letters, digits and single hyphens, up to 39. This is what unlocks the repository preview."
                />
              </div>
            </FieldGroup>
          </SectionCard>

          <SectionCard
            title="Skills"
            description="The list the matcher compares against required and preferred skills on every live posting."
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <label htmlFor="skill-input" className="sr-only">
                  Add a skill
                </label>
                <TextInput
                  id="skill-input"
                  value={skillDraft}
                  placeholder="Type a skill and press Enter"
                  onChange={(event) => {
                    setSkillDraft(event.target.value);
                    setSkillMessage(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSkill(skillDraft);
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                icon={Plus}
                disabled={!skillDraft.trim() || form.skills.length >= MAX_SKILLS}
                onClick={() => addSkill(skillDraft)}
              >
                Add
              </Button>
            </div>

            {skillMessage && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{skillMessage}</p>
            )}
            <ValidationError>
              {form.skills.length >= MAX_SKILLS
                ? `Capped at ${MAX_SKILLS}. A shorter list you actually have evidence for scores better than a long one.`
                : errorFor('skills')}
            </ValidationError>

            <div className="mt-3">
              {form.skills.length === 0 ? (
                <EmptyRow icon={Sparkles}>
                  No skills yet. Three is the minimum the profile completeness check counts.
                </EmptyRow>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {form.skills.map((skill) => (
                    <li key={skill}>
                      <Tag variant="removable" onRemove={() => removeSkill(skill)}>
                        {skill}
                      </Tag>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {form.skills.length}/{MAX_SKILLS} · spellings are folded onto one shared vocabulary
                when you save, so reactjs, React JS and React end up as a single entry.
              </p>
            </div>

            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                Skills named in current postings
              </p>
              {suggestedSkills.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  You already cover every skill on the board.
                </p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {suggestedSkills.map((skill) => (
                    <li key={skill}>
                      <button
                        type="button"
                        onClick={() => addSkill(skill)}
                        disabled={form.skills.length >= MAX_SKILLS}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus aria-hidden className="h-3 w-3" />
                        {skill}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          <CareerSection
            kind="experience"
            entries={form.experience}
            errors={errors}
            attempted={attempted}
            onAdd={() => setCareerModal({ kind: 'experience', index: null, entry: null })}
            onEdit={(index) =>
              setCareerModal({ kind: 'experience', index, entry: form.experience[index] })
            }
            onRemove={(index) => removeCareer('experience', index)}
          />

          <CareerSection
            kind="education"
            entries={form.education}
            errors={errors}
            attempted={attempted}
            onAdd={() => setCareerModal({ kind: 'education', index: null, entry: null })}
            onEdit={(index) =>
              setCareerModal({ kind: 'education', index, entry: form.education[index] })
            }
            onRemove={(index) => removeCareer('education', index)}
          />

          <SectionCard
            title="Job preferences"
            description={`What the matcher scores besides skills: work mode is worth ${MATCH_WEIGHTS.workMode} points, target level ${MATCH_WEIGHTS.experience}.`}
          >
            <div>
              <p
                id="work-mode-label"
                className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)]"
              >
                Desired work mode
              </p>
              <div className="mt-1.5">
                <SegmentedControl
                  ariaLabel="Desired work mode"
                  fullWidth
                  options={WORK_MODES}
                  value={form.preferences.workMode}
                  onChange={(value) => setPreference('workMode', value)}
                />
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                Any widens the net; an exact match scores full marks on this band, remote against
                hybrid scores 0.6, anything against on-site scores 0.25.
              </p>
            </div>

            <SelectField
              className="mt-4 max-w-sm"
              label="Target experience level"
              options={LEVEL_OPTIONS}
              value={form.preferences.experienceLevel}
              onChange={(event) => setPreference('experienceLevel', event.target.value)}
              hint="Defaults to your profile level. One step away scores 0.6 of this band, two steps 0.35."
            />

            <div className="mt-4">
              <p className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">
                Role types
              </p>
              <div className="mt-1.5 grid gap-x-6 sm:grid-cols-2">
                {ROLE_TYPES.map((type) => (
                  <CheckboxRow
                    key={type}
                    label={typeLabel(type)}
                    checked={form.preferences.roleTypes.includes(type)}
                    onChange={(checked) =>
                      setPreference(
                        'roleTypes',
                        checked
                          ? [...form.preferences.roleTypes, type]
                          : form.preferences.roleTypes.filter((item) => item !== type),
                      )
                    }
                  />
                ))}
              </div>
              <ValidationError>{errorFor('roleTypes')}</ValidationError>
            </div>

            <Field
              className="mt-4"
              label="Locations"
              htmlFor="location-input"
              hint="Free text, one per entry. Shown on your profile; not part of the score."
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <label htmlFor="location-input" className="sr-only">
                    Add a preferred location
                  </label>
                  <TextInput
                    id="location-input"
                    value={locationDraft}
                    placeholder="Remote (EU)"
                    onChange={(event) => setLocationDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addLocation();
                      }
                    }}
                  />
                </div>
                <Button variant="outline" icon={Plus} disabled={!locationDraft.trim()} onClick={addLocation}>
                  Add
                </Button>
              </div>
            </Field>

            {form.preferences.locations.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {form.preferences.locations.map((location) => (
                  <li key={location}>
                    <Tag
                      variant="removable"
                      onRemove={() =>
                        setPreference(
                          'locations',
                          form.preferences.locations.filter((item) => item !== location),
                        )
                      }
                    >
                      {location}
                    </Tag>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <div className="flex flex-wrap items-center justify-end gap-2 pb-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Discard
            </Button>
            <Button type="submit" loading={saving} disabled={!dirty || saving} icon={Save}>
              {saving ? 'Saving' : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <SectionCard title="How this saves">
            <ol className="space-y-2.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              <li>1. Every field above is local until you press save.</li>
              <li>
                2. Save writes one <code className="font-mono text-xs">developers.update</code> call
                carrying only the changed keys — arrays are replaced whole.
              </li>
              <li>3. Your changes are validated and saved to your profile.</li>
              <li>4. Every screen updates the moment the save finishes.</li>
            </ol>
          </SectionCard>

          <SectionCard title="What the matcher reads" description="In the order the score is built.">
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <ScoreRow label="Required skill coverage" points={MATCH_WEIGHTS.required} note="Your skills list" />
              <ScoreRow label="Preferred skill coverage" points={MATCH_WEIGHTS.preferred} note="Your skills list" />
              <ScoreRow label="Experience level alignment" points={MATCH_WEIGHTS.experience} note="Target level above" />
              <ScoreRow label="Work mode alignment" points={MATCH_WEIGHTS.workMode} note="Desired work mode above" />
            </ul>
            <p className="mt-3 border-t border-[var(--color-border)] pt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              Same inputs, same score. No clock, no randomness, no model.
            </p>
          </SectionCard>

          <SectionCard title="Not on this form">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Projects and the repository preview are edited on{' '}
              <Link to="/repositories" className="text-[var(--color-accent)] hover:underline">
                Repositories
              </Link>
              . Notification settings, theme and data reset live in{' '}
              <Link to="/settings" className="text-[var(--color-accent)] hover:underline">
                Settings
              </Link>
              .
            </p>
          </SectionCard>
        </div>
      </div>

      {careerModal && (
        <CareerModal
          kind={careerModal.kind}
          entry={careerModal.entry}
          index={careerModal.index}
          total={form[careerModal.kind].length}
          onClose={() => setCareerModal(null)}
          onSave={saveCareer}
        />
      )}

      <ConfirmDialog
        isOpen={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={leaveWithoutSaving}
        title="Discard unsaved changes?"
        description="You have edited this profile without saving. Leaving now drops those edits — the store only holds what you last saved."
        confirmLabel="Discard and leave"
        cancelLabel="Keep editing"
        danger
      />
    </form>
  );
}

function CareerSection({ kind, entries, errors, attempted, onAdd, onEdit, onRemove }) {
  const copy = CAREER_COPY[kind];
  const Icon = kind === 'experience' ? Briefcase : GraduationCap;
  return (
    <SectionCard
      title={copy.heading}
      description={copy.blurb}
      action={
        <Button variant="outline" size="sm" icon={Plus} onClick={onAdd}>
          {copy.addLabel}
        </Button>
      }
    >
      {entries.length === 0 ? (
        <EmptyRow icon={Icon}>
          Nothing under {copy.heading.toLowerCase()} yet. The completeness check expects at least
          one entry.
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {entries.map((entry, index) => (
            <li key={`${entry.title}-${index}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {entry.title || <span className="text-[var(--color-error)]">Missing title</span>}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  {entry.organization || 'Organisation not listed'} ·{' '}
                  {periodLabel(entry.startYear, entry.endYear)}
                </p>
                {entry.detail && (
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {entry.detail}
                  </p>
                )}
                <ValidationError>
                  {attempted
                    ? errors[`${kind}.${index}.title`] ?? errors[`${kind}.${index}.organization`]
                    : undefined}
                </ValidationError>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  icon={Pencil}
                  label={`Edit ${entry.title || copy.itemLabel}`}
                  variant="ghost"
                  onClick={() => onEdit(index)}
                />
                <IconButton
                  icon={X}
                  label={`Remove ${entry.title || copy.itemLabel}`}
                  variant="danger"
                  onClick={() => onRemove(index)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function CareerModal({ kind, entry, index, total, onClose, onSave }) {
  const copy = CAREER_COPY[kind];
  const [draft, setDraft] = useState(
    () => entry ?? { title: '', organization: '', startYear: '', endYear: '', detail: '' },
  );
  const [current, setCurrent] = useState(() => Boolean(entry && !entry.endYear));
  const [showErrors, setShowErrors] = useState(false);

  const problems = validateCareer(draft, kind);

  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    if (Object.keys(problems).length > 0) {
      setShowErrors(true);
      return;
    }
    onSave({
      title: draft.title.trim(),
      organization: draft.organization.trim(),
      startYear: draft.startYear.trim(),
      endYear: current ? '' : draft.endYear.trim(),
      detail: draft.detail.trim(),
    });
  }

  return (
    <Modal isOpen onClose={onClose} title={index === null ? copy.addLabel : `Edit ${copy.itemLabel}`} size="md">
      <div className="space-y-4">
        <TextField
          label={copy.title}
          required
          value={draft.title}
          onChange={(event) => update('title', event.target.value)}
          error={showErrors ? problems.title : undefined}
          hint={copy.titleHint}
        />
        <TextField
          label={copy.organization}
          required
          value={draft.organization}
          onChange={(event) => update('organization', event.target.value)}
          error={showErrors ? problems.organization : undefined}
          hint={copy.organizationHint}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Start year"
            required
            value={draft.startYear}
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => update('startYear', event.target.value)}
            error={showErrors ? problems.startYear : undefined}
          />
          <div>
            <TextField
              label="End year"
              value={current ? '' : draft.endYear}
              inputMode="numeric"
              maxLength={4}
              disabled={current}
              onChange={(event) => update('endYear', event.target.value)}
              error={showErrors ? problems.endYear : undefined}
            />
            <div className="mt-2">
              <Toggle
                label="Still here / ongoing"
                checked={current}
                onChange={setCurrent}
                description={kind === 'experience' ? 'Leaves the end year off so the row reads "current".' : 'For a course you have not finished.'}
              />
            </div>
          </div>
        </div>
        <TextAreaField
          label={copy.detail}
          rows={4}
          value={draft.detail}
          onChange={(event) => update('detail', event.target.value)}
          error={showErrors ? problems.detail : undefined}
          hint={copy.detailHint}
        />
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {index === null
            ? `This becomes entry ${total + 1}. Nothing is written to the store until you save the form.`
            : `Replaces entry ${index + 1} in place.`}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            {index === null ? 'Add entry' : 'Update entry'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ScoreRow({ label, points, note }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        {label}
        <span className="mt-0.5 block text-xs text-[var(--color-text-tertiary)]">{note}</span>
      </span>
      <span className="shrink-0 text-xs tabular-nums text-[var(--color-text-tertiary)]">
        {points} pts
      </span>
    </li>
  );
}

function buildForm(user) {
  if (!user) {
    return {
      name: '',
      headline: '',
      location: '',
      bio: '',
      experienceLevel: 'mid',
      openTo: 'new-roles',
      visibility: 'public',
      website: '',
      linkedIn: '',
      githubUsername: '',
      skills: [],
      experience: [],
      education: [],
      preferences: { workMode: 'any', experienceLevel: 'mid', roleTypes: ['full-time'], locations: [] },
    };
  }
  return {
    name: user.name ?? '',
    headline: user.headline ?? '',
    location: user.location ?? '',
    bio: user.bio ?? '',
    experienceLevel: user.experienceLevel ?? 'mid',
    openTo: user.openTo ?? 'new-roles',
    visibility: user.visibility ?? 'public',
    website: user.website ?? '',
    linkedIn: user.linkedIn ?? '',
    githubUsername: user.githubUsername ?? '',
    skills: [...(user.skills ?? [])],
    experience: (user.experience ?? []).map((entry) => ({
      title: entry.title ?? '',
      organization: entry.organization ?? '',
      startYear: entry.startYear ?? '',
      endYear: entry.endYear ?? '',
      detail: entry.detail ?? '',
    })),
    education: (user.education ?? []).map((entry) => ({
      title: entry.title ?? '',
      organization: entry.organization ?? '',
      startYear: entry.startYear ?? '',
      endYear: entry.endYear ?? '',
      detail: entry.detail ?? '',
    })),
    preferences: {
      workMode: user.preferences?.workMode ?? 'any',
      experienceLevel: user.preferences?.experienceLevel ?? user.experienceLevel ?? 'mid',
      roleTypes: [...(user.preferences?.roleTypes ?? ['full-time'])],
      locations: [...(user.preferences?.locations ?? [])],
    },
  };
}

function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length > 60) errors.name = '60 characters maximum.';

  const headline = form.headline.trim();
  if (!headline) errors.headline = 'Headline is required — it sits under your name everywhere.';
  else if (headline.length > 110) errors.headline = '110 characters maximum.';

  if (!form.location.trim()) errors.location = 'Location is required.';

  const bio = form.bio.trim();
  if (!bio) errors.bio = 'Summary is required.';
  else if (bio.length < 40) errors.bio = `Only ${bio.length} characters — write at least 40.`;
  else if (form.bio.length > 4000) errors.bio = '4000 characters is the store limit.';

  if (form.website.trim() && !/^https?:\/\/[^\s]+$/i.test(form.website.trim())) {
    errors.website = 'Start with http:// or https://';
  }
  const linkedIn = form.linkedIn.trim();
  if (linkedIn && /\s/.test(linkedIn)) errors.linkedIn = 'No spaces — keep the handle only.';
  else if (linkedIn && /^https?:\/\//i.test(linkedIn)) {
    errors.linkedIn = 'Drop the domain: store in/your-name, not the full URL.';
  }
  const githubHandle = form.githubUsername.trim();
  if (githubHandle && !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(githubHandle)) {
    errors.githubUsername =
      '1–39 characters: letters, digits and single hyphens, no leading or trailing hyphen.';
  }

  if (form.skills.length > MAX_SKILLS) errors.skills = `${MAX_SKILLS} skills maximum.`;
  if (form.preferences.roleTypes.length === 0) {
    errors.roleTypes = 'Select at least one role type, or no posting will qualify.';
  }

  for (const kind of ['experience', 'education']) {
    form[kind].forEach((entry, index) => {
      for (const [key, message] of Object.entries(validateCareer(entry, kind))) {
        errors[`${kind}.${index}.${key}`] = message;
      }
    });
  }
  return errors;
}

function validateCareer(entry, kind) {
  const problems = {};
  const label = kind === 'experience' ? 'role' : 'qualification';
  if (!String(entry.title ?? '').trim()) problems.title = `Every ${label} needs a title.`;
  if (String(entry.title ?? '').trim().length > 160) problems.title = '160 characters maximum.';
  if (!String(entry.organization ?? '').trim()) {
    problems.organization = kind === 'experience' ? 'Name the employer or client.' : 'Name the institution.';
  }
  const start = String(entry.startYear ?? '').trim();
  if (!start) problems.startYear = 'Start year is required.';
  else if (!/^\d{4}$/.test(start)) problems.startYear = 'Four digits, e.g. 2023.';
  const end = String(entry.endYear ?? '').trim();
  if (end && !/^\d{4}$/.test(end)) problems.endYear = 'Four digits, or leave it blank for current.';
  else if (end && start && Number(end) < Number(start)) problems.endYear = 'End year cannot precede the start year.';
  if (String(entry.detail ?? '').trim().length > 800) problems.detail = '800 characters is the store limit.';
  return problems;
}

function buildPatch(form, base) {
  const patch = {};
  for (const key of [
    'name',
    'headline',
    'location',
    'bio',
    'experienceLevel',
    'openTo',
    'visibility',
    'website',
    'linkedIn',
    'githubUsername',
  ]) {
    if (form[key].trim() !== String(base[key]).trim()) patch[key] = form[key].trim();
  }
  if (form.skills.join('\u0000') !== base.skills.join('\u0000')) patch.skills = form.skills;
  if (JSON.stringify(form.experience) !== JSON.stringify(base.experience)) {
    patch.experience = form.experience;
  }
  if (JSON.stringify(form.education) !== JSON.stringify(base.education)) {
    patch.education = form.education;
  }
  if (JSON.stringify(form.preferences) !== JSON.stringify(base.preferences)) {
    patch.preferences = form.preferences;
  }
  return patch;
}

function periodLabel(startYear, endYear) {
  if (!startYear) return 'Dates not listed';
  return endYear ? `${startYear} — ${endYear}` : `${startYear} — current`;
}

function typeLabel(type) {
  return { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', internship: 'Internship' }[type] ?? type;
}

export default ProfileEdit;
