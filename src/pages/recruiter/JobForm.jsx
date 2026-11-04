import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Send, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context';
import { useStoreValue, store } from '../../hooks/useStore';
import { jobs as jobsApi } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { SectionCard, Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { IconButton } from '../../components/common/IconButton';
import { Field, SelectField, TextAreaField, TextField, TextInput, ValidationError } from '../../components/common/Field';
import { Tag } from '../../components/common/Tag';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';

const WORK_MODES = ['remote', 'hybrid', 'onsite'];
const JOB_TYPES = ['full-time', 'contract', 'part-time', 'internship'];
const LEVELS = ['junior', 'mid', 'senior', 'lead', 'principal'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD'];
const PERIODS = [
  { value: 'year', label: 'Per year' },
  { value: 'month', label: 'Per month' },
  { value: 'hour', label: 'Per hour' },
];

const FIELD_ID = {
  title: 'jf-title',
  location: 'jf-location',
  salary: 'jf-salary-min',
  requiredSkills: 'jf-required-skill',
  description: 'jf-description',
  applyDeadline: 'jf-deadline',
};
const ERROR_ORDER = ['title', 'location', 'requiredSkills', 'salary', 'description', 'applyDeadline'];

const label = (value) => String(value).replace(/-/g, ' ');
const toOptions = (values) => values.map((v) => ({ value: v, label: label(v) }));

function emptyValues() {
  return {
    title: '',
    location: '',
    workMode: 'remote',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    salaryPeriod: 'year',
    requiredSkills: [],
    preferredSkills: [],
    description: '',
    responsibilities: [],
    applyDeadline: '',
  };
}

function valuesFromJob(job) {
  return {
    title: job.title ?? '',
    location: job.location ?? '',
    workMode: job.workMode ?? 'remote',
    jobType: job.jobType ?? 'full-time',
    experienceLevel: job.experienceLevel ?? 'mid',
    salaryMin: job.salary?.min != null ? String(job.salary.min) : '',
    salaryMax: job.salary?.max != null ? String(job.salary.max) : '',
    currency: job.salary?.currency ?? 'USD',
    salaryPeriod: job.salary?.period ?? 'year',
    requiredSkills: [...(job.requiredSkills ?? [])],
    preferredSkills: [...(job.preferredSkills ?? [])],
    description: job.description ?? '',
    responsibilities: [...(job.responsibilities ?? [])],
    applyDeadline: job.applyDeadline ? job.applyDeadline.slice(0, 10) : '',
  };
}

// Keyed by route id so switching between "new" and a given posting remounts and
// re-hydrates the form, keeping the store as the only source of the saved record.
export function JobForm() {
  const { id } = useParams();
  return <JobFormFields key={id ?? 'new'} id={id} />;
}

function JobFormFields({ id }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, userId, isRecruiter } = useAuth();

  const editing = Boolean(id);
  const job = useStoreValue(
    () => (editing && userId ? store.getJobDetail(id) : null),
    [editing, id, userId],
  );
  const company = useStoreValue(
    () => (user?.companyId ? store.getCompany(user.companyId) : null),
    [user?.companyId],
  );
  const knownSkills = useMemo(() => jobsApi.facets().skills, []);

  // The store read is synchronous, so the first render already has the record — no
  // effect-driven hydration, and a later snapshot write cannot clobber in-progress edits.
  const [values, setValues] = useState(() => (job ? valuesFromJob(job) : emptyValues()));
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(null);
  const [skillDraft, setSkillDraft] = useState({ required: '', preferred: '' });
  const [leaveOpen, setLeaveOpen] = useState(false);

  function update(patch) {
    setValues((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function addSkill(kind) {
    const raw = skillDraft[kind].trim();
    if (!raw) return;
    const existing = values[`${kind}Skills`];
    if (existing.some((s) => s.toLowerCase() === raw.toLowerCase())) {
      setSkillDraft((d) => ({ ...d, [kind]: '' }));
      return;
    }
    update({ [`${kind}Skills`]: [...existing, raw] });
    setSkillDraft((d) => ({ ...d, [kind]: '' }));
  }

  function removeSkill(kind, skill) {
    update({ [`${kind}Skills`]: values[`${kind}Skills`].filter((s) => s !== skill) });
  }

  function validate() {
    const found = {};
    if (!values.title.trim()) found.title = 'Give the role a clear title, such as “Senior Backend Engineer”.';
    if (!values.location.trim()) found.location = 'Candidates filter by location — add the primary site or “Remote”.';
    if (!values.requiredSkills.length) found.requiredSkills = 'Add at least one required skill so matches can be scored.';

    const hasMin = values.salaryMin.trim() !== '';
    const hasMax = values.salaryMax.trim() !== '';
    if (hasMin || hasMax) {
      const min = Number(values.salaryMin);
      const max = Number(values.salaryMax);
      if (hasMin && hasMax) {
        if (!Number.isFinite(min) || !Number.isFinite(max)) found.salary = 'Salary values must be numbers.';
        else if (min > max) found.salary = 'The minimum cannot be higher than the maximum.';
      } else {
        found.salary = 'Fill in both the minimum and maximum, or leave both blank.';
      }
    }

    if (!values.description.trim()) found.description = 'Describe the role in your own words — what the person will actually work on.';

    if (values.applyDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Date.parse(values.applyDeadline) < today.getTime()) {
        found.applyDeadline = 'The deadline is already in the past. Pick a future date.';
      }
    }
    return found;
  }

  function buildPayload() {
    const min = Number(values.salaryMin);
    const max = Number(values.salaryMax);
    const hasSalary = values.salaryMin.trim() !== '' || values.salaryMax.trim() !== '';
    return {
      title: values.title.trim(),
      location: values.location.trim(),
      workMode: values.workMode,
      jobType: values.jobType,
      experienceLevel: values.experienceLevel,
      salary: hasSalary
        ? {
            min: Number.isFinite(min) ? min : undefined,
            max: Number.isFinite(max) ? max : undefined,
            currency: values.currency,
            period: values.salaryPeriod,
          }
        : null,
      requiredSkills: values.requiredSkills,
      preferredSkills: values.preferredSkills,
      description: values.description.trim(),
      responsibilities: values.responsibilities.map((r) => r.trim()).filter(Boolean),
      applyDeadline: values.applyDeadline ? new Date(values.applyDeadline).toISOString() : null,
    };
  }

  async function submit(mode) {
    if (!user) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = ERROR_ORDER.find((key) => found[key]);
      if (first) document.getElementById(FIELD_ID[first])?.focus();
      toast.error('Fix the highlighted fields before saving.');
      return;
    }

    setSaving(mode);
    const payload = buildPayload();
    let targetId = id;
    try {
      if (editing) {
        await jobsApi.update(id, payload);
      } else {
        const created = await jobsApi.create(userId, {
          ...payload,
          companyId: user.companyId,
          status: 'draft',
        });
        targetId = created.id;
      }
      if (mode === 'publish') await jobsApi.setStatus(targetId, 'published');
      setDirty(false);
      toast.success(
        mode === 'publish'
          ? `Published “${payload.title}”. It is live for applicants.`
          : `Saved “${payload.title}” as a draft.`,
      );
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err?.message ?? 'The posting could not be saved.');
    } finally {
      setSaving(null);
    }
  }

  function attemptCancel() {
    if (dirty) setLeaveOpen(true);
    else navigate('/recruiter/jobs');
  }

  if (!isRecruiter) {
    return (
      <div>
        <PageHeader eyebrow="Recruiter workspace" title="Post a job" back={{ to: '/recruiter/jobs' }} />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Only recruiter accounts can create or edit postings.
        </p>
      </div>
    );
  }

  if (editing && !job) {
    return (
      <div>
        <PageHeader eyebrow="Recruiter workspace" title="Edit posting" back={{ to: '/recruiter/jobs' }} />
        <EmptyState
          icon="jobs"
          title="This posting no longer exists"
          description="It may have been deleted. Head back to your postings to pick another."
          action={
            <Button to="/recruiter/jobs" size="sm">
              Back to postings
            </Button>
          }
        />
      </div>
    );
  }

  if (editing && job.recruiterId !== userId) {
    return (
      <div>
        <PageHeader eyebrow="Recruiter workspace" title="Edit posting" back={{ to: '/recruiter/jobs' }} />
        <Card className="p-5">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            You do not have access to this posting
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            “{job.title}” belongs to another recruiter. You can only edit postings under your own
            account.
          </p>
          <Button to="/recruiter/jobs" size="sm" className="mt-4">
            Back to your postings
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Recruiter workspace"
        title={editing ? 'Edit posting' : 'Post a job'}
        description={
          editing
            ? 'Update the details, then publish to refresh the live listing or save to keep it as a draft.'
            : 'Publish to open the role to applicants, or save a draft and finish it later.'
        }
        back={{ to: '/recruiter/jobs' }}
        actions={
          <>
            <Button variant="outline" onClick={attemptCancel} disabled={saving !== null}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => submit('draft')} loading={saving === 'draft'} disabled={saving !== null}>
              Save draft
            </Button>
            <Button icon={Send} onClick={() => submit('publish')} loading={saving === 'publish'} disabled={saving !== null}>
              {editing && job?.status === 'published' ? 'Save & republish' : 'Publish'}
            </Button>
          </>
        }
      />

      <ValidationError className="mb-3">
        {Object.keys(errors).length > 0
          ? `${Object.keys(errors).length} field${Object.keys(errors).length === 1 ? '' : 's'} need attention before you can save. The first one is highlighted below.`
          : ''}
      </ValidationError>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="The role">
            <div className="space-y-4">
              <TextField
                id={FIELD_ID.title}
                label="Job title"
                required
                placeholder="Senior Backend Engineer"
                value={values.title}
                onChange={(e) => update({ title: e.target.value })}
                error={errors.title}
              />
              <TextField
                id={FIELD_ID.location}
                label="Location"
                required
                placeholder="Remote (EU) or Berlin, Germany"
                value={values.location}
                onChange={(e) => update({ location: e.target.value })}
                error={errors.location}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="Work mode"
                  value={values.workMode}
                  onChange={(e) => update({ workMode: e.target.value })}
                  options={toOptions(WORK_MODES)}
                />
                <SelectField
                  label="Employment type"
                  value={values.jobType}
                  onChange={(e) => update({ jobType: e.target.value })}
                  options={toOptions(JOB_TYPES)}
                />
                <SelectField
                  label="Experience level"
                  value={values.experienceLevel}
                  onChange={(e) => update({ experienceLevel: e.target.value })}
                  options={toOptions(LEVELS)}
                />
              </div>
              <TextAreaField
                id={FIELD_ID.description}
                label="Description"
                required
                rows={6}
                placeholder="What the person will own, the team around them, and why the role exists."
                value={values.description}
                onChange={(e) => update({ description: e.target.value })}
                error={errors.description}
              />
            </div>
          </SectionCard>

          <SectionCard title="Skills">
            <div className="space-y-5">
              <SkillEditor
                id={FIELD_ID.requiredSkills}
                kind="required"
                label="Required skills"
                hint="Used directly in match scoring. Candidates missing these are flagged."
                draft={skillDraft.required}
                setDraft={(v) => setSkillDraft((d) => ({ ...d, required: v }))}
                onAdd={() => addSkill('required')}
                onRemove={(skill) => removeSkill('required', skill)}
                skills={values.requiredSkills}
                knownSkills={knownSkills}
                error={errors.requiredSkills}
              />
              <SkillEditor
                id="jf-preferred-skill"
                kind="preferred"
                label="Preferred skills"
                hint="Nice-to-haves. They lift the score but never block a match."
                draft={skillDraft.preferred}
                setDraft={(v) => setSkillDraft((d) => ({ ...d, preferred: v }))}
                onAdd={() => addSkill('preferred')}
                onRemove={(skill) => removeSkill('preferred', skill)}
                skills={values.preferredSkills}
                knownSkills={knownSkills}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Responsibilities"
            description="Up to ten lines. Leave blank to describe everything in the summary instead."
          >
            <div className="space-y-2.5">
              {values.responsibilities.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TextInput
                    aria-label={`Responsibility ${index + 1}`}
                    value={line}
                    onChange={(e) =>
                      update({
                        responsibilities: values.responsibilities.map((r, i) =>
                          i === index ? e.target.value : r,
                        ),
                      })
                    }
                  />
                  <IconButton
                    icon={Trash2}
                    label={`Remove responsibility ${index + 1}`}
                    variant="danger"
                    onClick={() =>
                      update({ responsibilities: values.responsibilities.filter((_, i) => i !== index) })
                    }
                  />
                </div>
              ))}
              {values.responsibilities.length < 10 && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => update({ responsibilities: [...values.responsibilities, ''] })}
                >
                  Add responsibility
                </Button>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Company" description="Postings are tied to your organisation. This cannot be changed here.">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] text-sm font-semibold text-[var(--color-text-primary)]">
                {(company?.name ?? user?.companyName ?? 'D').slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {company?.name ?? user?.companyName ?? 'DevConnect'}
                </p>
                {company?.location && (
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">{company.location}</p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Compensation">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  id={FIELD_ID.salary}
                  label="Minimum"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="120000"
                  value={values.salaryMin}
                  onChange={(e) => update({ salaryMin: e.target.value })}
                  error={errors.salary}
                />
                <TextField
                  label="Maximum"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="160000"
                  value={values.salaryMax}
                  onChange={(e) => update({ salaryMax: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Currency"
                  value={values.currency}
                  onChange={(e) => update({ currency: e.target.value })}
                  options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                />
                <SelectField
                  label="Basis"
                  value={values.salaryPeriod}
                  onChange={(e) => update({ salaryPeriod: e.target.value })}
                  options={PERIODS}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Application window">
            <TextField
              id={FIELD_ID.applyDeadline}
              label="Apply by (optional)"
              type="date"
              value={values.applyDeadline}
              onChange={(e) => update({ applyDeadline: e.target.value })}
              error={errors.applyDeadline}
              hint="Leave blank to keep the role open until you close it."
            />
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        isOpen={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={() => navigate('/recruiter/jobs')}
        danger
        title="Discard unsaved changes?"
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        description="You have edits that are not saved. Leaving now discards them — nothing is written to the posting."
      />
    </div>
  );
}

function SkillEditor({ id, label: fieldLabel, hint, skills, knownSkills, draft, setDraft, onAdd, onRemove, error }) {
  return (
    <Field label={fieldLabel} htmlFor={id} hint={hint} error={error}>
      <div className="flex gap-2">
        <TextInput
          id={id}
          list="known-skills"
          autoComplete="off"
          placeholder="Type a skill and press Enter"
          value={draft}
          invalid={Boolean(error)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={onAdd} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
      <datalist id="known-skills">
        {knownSkills.map((skill) => (
          <option key={skill} value={skill} />
        ))}
      </datalist>
      {skills.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill}>
              <Tag onRemove={() => onRemove(skill)}>{skill}</Tag>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
          <X className="h-3 w-3" aria-hidden />
          None added yet.
        </p>
      )}
    </Field>
  );
}

export default JobForm;
