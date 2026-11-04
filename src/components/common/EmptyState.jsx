import { cn } from '../../utils/cn';
import { 
  Inbox, AlertCircle, CheckCircle, Search, Users, Briefcase, 
  Code2, Bell, FolderOpen, MessageSquare, Star, TrendingUp 
} from 'lucide-react';

const icons = {
  default: Inbox,
  error: AlertCircle,
  success: CheckCircle,
  search: Search,
  users: Users,
  jobs: Briefcase,
  projects: Code2,
  notifications: Bell,
  connections: Users,
  recommendations: Star,
  messages: MessageSquare,
  analytics: TrendingUp,
  empty: FolderOpen,
};

export function EmptyState({
  icon = 'default',
  title,
  description,
  action,
  className = '',
  compact = false,
}) {
  const Icon = icons[icon] || icons.default;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 text-center',
        compact ? 'py-8' : 'py-14',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)]',
          compact ? 'p-3' : 'p-4',
        )}
      >
        <Icon
          aria-hidden
          className={cn('text-[var(--color-text-tertiary)]', compact ? 'h-5 w-5' : 'h-6 w-6')}
        />
      </div>

      {title && (
        <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

// Scenario states. Each one names what is missing and the next action that fixes it.

export function NoConnections({ action }) {
  return (
    <EmptyState
      icon="connections"
      title="No connections yet"
      description="Connections are two-way. Send a request from Discover and it will show up here once it is accepted."
      action={action}
    />
  );
}

export function NoProjects({ action }) {
  return (
    <EmptyState
      icon="projects"
      title="You have not added a project"
      description="Recruiters open this tab on your profile. One project with a link and a paragraph on your role is enough to start."
      action={action}
    />
  );
}

export function NoJobs({ action, filtered }) {
  return (
    <EmptyState
      icon="jobs"
      title={filtered ? 'Nothing matches these filters' : 'No postings yet'}
      description={
        filtered
          ? 'Every filter has to match, so a rare skill combined with a strict salary floor empties the list quickly. Remove one and try again.'
          : 'Published roles from your team appear here. Create a posting to start collecting applications.'
      }
      action={action}
    />
  );
}

export function NoNotifications({ action }) {
  return (
    <EmptyState
      icon="notifications"
      title="Nothing new"
      description="Application updates, interview scheduling and connection requests all land here. Read items stay in the All tab."
      action={action}
    />
  );
}

export function NoSearchResults({ query, action }) {
  return (
    <EmptyState
      icon="search"
      title={`No results for "${query}"`}
      description="Search covers job titles, companies, locations and skills. A shorter phrase or a single skill usually returns more."
      action={action}
    />
  );
}

export function NoRecommendations({ action }) {
  return (
    <EmptyState
      icon="recommendations"
      title="No postings clear the 40% threshold"
      description="Scores come from your required skills, experience level and preferred work mode. Adding skills to your profile raises coverage."
      action={action}
    />
  );
}

export function NoApplications({ action, role = 'developer' }) {
  return (
    <EmptyState
      icon="jobs"
      title={role === 'recruiter' ? 'No applications on your postings' : 'You have not applied to anything yet'}
      description={
        role === 'recruiter'
          ? 'Once candidates apply, their timelines appear here and stay in sync with each job page.'
          : 'Applications you send keep their status history here — applied, under review, interview, offer.'
      }
      action={action}
    />
  );
}

export function NoSavedJobs({ action }) {
  return (
    <EmptyState
      icon="jobs"
      compact
      title="No saved postings"
      description="Use the bookmark on any job to keep it here. Saved jobs are stored per account and survive a refresh."
      action={action}
    />
  );
}

export function NoResults({ title = 'Nothing here', description, action, compact = false, icon = 'default' }) {
  return (
    <EmptyState icon={icon} title={title} description={description} action={action} compact={compact} />
  );
}

