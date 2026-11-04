import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  Check,
  GitCompareArrows,
  Monitor,
  Moon,
  ScrollText,
  Sun,
  Users,
} from 'lucide-react';
import { useAuth, useTheme } from '../context';
import { useStoreValue, store } from '../hooks/useStore';
import { MATCH_WEIGHTS } from '../lib/matching';
import { jobs } from '../services/api';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { Dropdown, DropdownItem, DropdownLabel } from '../components/common/Dropdown';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatNumber, pluralize } from '../utils/format';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Follow system', icon: Monitor },
];

/**
 * Band thresholds mirror `scoreMatch` in src/lib/matching.js. They are not exported from
 * there, so they are restated here rather than invented: strong >= 75, good >= 55, else fair.
 */
const BANDS = [
  { label: 'Strong match', min: 75, max: 100 },
  { label: 'Worth a look', min: 55, max: 74 },
  { label: 'Weak overlap', min: 0, max: 54 },
];

const WEIGHT_COPY = {
  required: 'Required skills you actually list. The biggest single lever on the score.',
  preferred: 'Nice-to-have skills from the posting. Partial credit, proportionally.',
  experience: 'How your level compares with the level the posting asks for.',
  workMode: "Whether the posting's remote/hybrid/onsite setting is one you accept.",
};

const DEVELOPER_POINTS = [
  {
    icon: GitCompareArrows,
    title: 'Ranked matches, not a feed',
    body: 'Every open posting is scored against your skills, level and work-mode preferences, then sorted by that score with the reasons written out.',
    to: '/matches',
    cta: 'See matching',
  },
  {
    icon: ScrollText,
    title: 'One application trail',
    body: 'Apply from a posting and the application stays in one list: applied, under review, interview, offer, rejected, withdrawn.',
    to: '/applications',
    cta: 'See applications',
  },
  {
    icon: BookOpenCheck,
    title: 'A profile that says why',
    body: 'Skills, experience, education, projects and preferences in one place, with a completeness check that names the fields recruiters read first.',
    to: '/profile/edit',
    cta: 'Edit a profile',
  },
];

const RECRUITER_POINTS = [
  {
    icon: Briefcase,
    title: 'Postings with real requirements',
    body: 'Required and preferred skills, level, work mode and rate band — the same fields the matcher scores against, so a posting explains its own results.',
    to: '/recruiter/jobs',
    cta: 'See postings',
  },
  {
    icon: ScrollText,
    title: 'One pipeline per posting',
    body: 'Move candidates through applied, screening, interview and offer, with a note and an interview slot on each transition.',
    to: '/recruiter/applicants',
    cta: 'See pipeline',
  },
  {
    icon: Users,
    title: 'Candidate search you can justify',
    body: 'Filter developers by skill, level and location, save the ones worth revisiting, and see the match score beside each name.',
    to: '/recruiter/candidates',
    cta: 'See candidates',
  },
];

const TRUST_ITEMS = [
  'Every score is shown with the skills behind it, so a match is never a black box.',
  'One profile drives both sides — what a developer sees and what a recruiter ranks on are the same numbers.',
  'A posting is advice, not a gate: nothing auto-rejects a candidate it has not been tuned to.',
  'Skills are read as data, not vibes — names are normalised so React, react and ReactJS mean one thing.',
];

const CARE_ITEMS = [
  'Sign up as a developer or a recruiter, and the workspace you land in is built for that job.',
  'Your profile, applications and connections stay yours — export or remove them any time.',
  'Notifications only fire on the events you turn on, grouped by what actually changed.',
  'Search, filters and sorting run across the whole board, not just what someone decided to surface.',
];

export function Landing() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme, reduceMotion } = useTheme();
  const diagnostics = useStoreValue(() => {
    const snapshot = store.getSnapshot();
    const { counts, available } = store.storageDiagnostics();
    return {
      counts,
      available,
      developers: snapshot.users.filter((u) => u.role === 'developer').length,
      recruiters: snapshot.users.filter((u) => u.role === 'recruiter').length,
    };
  }, []);
  const skillCount = useStoreValue(() => (jobs.facets().skills ?? []).length, []);

  const { counts, available, developers, recruiters } = diagnostics;
  const totalWeight = Object.values(MATCH_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

  const entrance = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' },
      };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo size="sm" />
            <span className="sr-only">DevConnect home</span>
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            <Dropdown
              label="Change theme"
              width="w-48"
              trigger={
                <span className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)]">
                  {theme === 'dark' ? (
                    <Moon aria-hidden className="h-4 w-4" />
                  ) : theme === 'light' ? (
                    <Sun aria-hidden className="h-4 w-4" />
                  ) : (
                    <Monitor aria-hidden className="h-4 w-4" />
                  )}
                </span>
              }
            >
              <DropdownLabel>Appearance</DropdownLabel>
              {THEME_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  icon={option.icon}
                  active={theme === option.value}
                  onClick={() => setTheme(option.value)}
                >
                  {option.label}
                  {theme === option.value && (
                    <Check aria-hidden className="ml-auto h-3.5 w-3.5 text-[var(--color-accent)]" />
                  )}
                </DropdownItem>
              ))}
            </Dropdown>
            {isAuthenticated ? (
              <Button to="/" size="sm" icon={ArrowRight} iconPosition="right">
                Open your app
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button to="/register" size="sm">
                  Create account
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <motion.section {...entrance} className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Developer network &middot; job matching you can read
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            A job match you can read: {pluralize(counts.jobs, 'posting')}, scored against your skills
            with the reasons shown
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            DevConnect scores a developer against a posting with four documented weights, then prints the maths.
            No black box, no ranking you have to trust — and no recruiter sees a different number for the same
            profile.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button to="/login" size="lg" icon={ArrowRight} iconPosition="right">
              Browse jobs
            </Button>
            <Button to="/register" size="lg" variant="outline">
              Create a free account
            </Button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
            {available
              ? 'Pick a sample profile on the sign-in page to explore a populated account.'
              : 'Storage is unavailable in this browser, so changes will not be saved between visits.'}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
            <Fact label="Developer profiles" value={developers} />
            <Fact label="Recruiter accounts" value={recruiters} />
            <Fact label="Open postings" value={counts.jobs} />
            <Fact label="Skills across postings" value={skillCount} />
          </dl>
        </motion.section>

        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Two roles, two different jobs to do
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              The same store serves both. What changes is what you are allowed to write.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <RoleColumn
                title="For developers"
                points={DEVELOPER_POINTS}
                footnote={`Developers on DevConnect have submitted ${formatNumber(counts.applications)} applications so far.`}
              />
              <RoleColumn
                title="For recruiters"
                points={RECRUITER_POINTS}
                footnote={`Postings, pipeline and saved candidates are write-restricted to recruiter accounts.`}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                How matching works
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                It is a documented heuristic, not a trained model. Nothing learns, nothing is fitted to your
                behaviour, and no other developer influences your score. A posting and a profile are compared on
                four axes that always add up to {totalWeight}, and the same inputs always give the same output.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Skill names are canonicalised before comparison, so <code>react</code>, <code>React</code> and{' '}
                <code>ReactJS</code> count as one skill. Missing evidence scores zero rather than guessing.
              </p>
              <ul className="mt-5 space-y-2">
                {BANDS.map((band) => (
                  <li key={band.label} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-[var(--color-text-primary)]">{band.label}</span>
                    <span className="tabular-nums text-[var(--color-text-tertiary)]">
                      {band.min}–{band.max}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
                The weights behind every score
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                Every match is built from these four factors. They are fixed and shared between both sides, so a
                score means the same thing to a developer and to the recruiter looking at them.
              </p>
              <ul className="mt-4 space-y-4">
                {Object.entries(MATCH_WEIGHTS).map(([key, weight]) => (
                  <li key={key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{labelFor(key)}</span>
                      <span className="text-sm tabular-nums text-[var(--color-text-secondary)]">
                        {weight} points
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-1.5"
                      value={weight}
                      max={totalWeight}
                      size="sm"
                      tone={key === 'required' ? 'accent' : 'default'}
                    />
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                      {WEIGHT_COPY[key]}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                The score is advice, not a gate. A posting never auto-rejects you, and the reasons behind every
                number are listed next to it.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Built to be read, not just ranked
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Matching is only useful when you can see why it made a call. DevConnect keeps the reasoning, the
              weights and the data in the open on both sides of the table.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <FactList title="Transparency" items={TRUST_ITEMS} />
              <FactList title="How it works for you" items={CARE_ITEMS} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo size="sm" />
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              A developer network where job matching is explained, not hidden — profiles, postings and applications
              in one place.
            </p>
          </div>
          <nav aria-label="Account links" className="flex flex-wrap items-center gap-4">
            <FooterLink to="/login">Sign in</FooterLink>
            <FooterLink to="/register">Create account</FooterLink>
            <FooterLink to="/forgot-password">Forgot password</FooterLink>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function labelFor(key) {
  if (key === 'workMode') return 'Work mode';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function Fact({ label, value }) {
  return (
    <div className="bg-[var(--color-surface)] px-4 py-3">
      <dt className="text-xs text-[var(--color-text-tertiary)]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

function RoleColumn({ title, points, footnote }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h3>
      <ul className="mt-4 space-y-4">
        {points.map(({ icon: Icon, title: pointTitle, body, to, cta }) => (
          <li key={pointTitle} className="flex gap-3">
            <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{pointTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
              <Link
                to={to}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
              >
                {cta}
                <ArrowRight aria-hidden className="h-3 w-3" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
        {footnote}
      </p>
    </div>
  );
}

function FactList({ title, items }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
        <Check aria-hidden className="h-4 w-4 text-[var(--color-success)]" />
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
    >
      {children}
    </Link>
  );
}

export default Landing;
