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
  illustration = 'simple',
}) {
  const Icon = icons[icon] || icons.default;
  
  // Different illustration styles
  const illustrationStyles = {
    simple: 'h-16 w-16',
    medium: 'h-20 w-20',
    large: 'h-24 w-24',
  };
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-up', 
      className
    )}>
      {/* Animated icon container */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full opacity-10 blur-xl animate-pulse-soft" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-[var(--color-surface-alt)] to-[var(--color-surface)] border border-[var(--color-border)] shadow-lg animate-float">
          <Icon className={cn('text-[var(--color-primary)]', illustrationStyles[illustration] || illustrationStyles.simple)} />
        </div>
      </div>
      
      {title && (
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2 tracking-tight">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-2 animate-slide-up">
          {action}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function NoConnections({ action }) {
  return (
    <EmptyState
      icon="connections"
      title="No connections yet"
      description="Start building your network by connecting with other developers. Share knowledge, collaborate on projects, and grow together."
      action={action}
    />
  );
}

export function NoProjects({ action }) {
  return (
    <EmptyState
      icon="projects"
      title="No projects to show"
      description="Showcase your best work! Add your first project and let others see what you've built."
      action={action}
    />
  );
}

export function NoJobs({ action }) {
  return (
    <EmptyState
      icon="jobs"
      title="No matching jobs"
      description="We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later."
      action={action}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon="notifications"
      title="All caught up!"
      description="You have no new notifications. This is a great time to explore new opportunities."
    />
  );
}

export function NoSearchResults({ query, action }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try different keywords or adjust your filters.`}
      action={action}
    />
  );
}

export function NoRecommendations() {
  return (
    <EmptyState
      icon="recommendations"
      title="Building your recommendations"
      description="Complete your profile and add more skills to get personalized recommendations."
    />
  );
}
