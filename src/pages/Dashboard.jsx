import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar } from '../components/common';
import { DashboardSkeleton } from '../components/common/LoadingSkeleton';
import { Users, Briefcase, Bell, Settings, Code2, ArrowRight, Search, Plus } from 'lucide-react';
import { developersService, connectionsService, notificationsService, projectsService } from '../services';

export function Dashboard() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const [profileData, recommendedData, pendingData, notificationsData, projectsData] = await Promise.all([
          developersService.getCurrentProfile(),
          developersService.getRecommended(),
          connectionsService.getPendingRequests(),
          notificationsService.getNotifications({ limit: 4 }),
          projectsService.getProjects({ featured: true, limit: 3 }),
        ]);
        
        setProfile(profileData);
        setRecommended(recommendedData);
        setPendingRequests(pendingData);
        setNotifications(notificationsData);
        setFeaturedProjects(projectsData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">Failed to load dashboard. Please try again.</p>
        </div>
      </div>
    );
  }
  
  const completionPercentage = profile?.completionPercentage || 0;
  
  return (
    <div className="dashboard-page space-y-7">
      {/* Welcome Section */}
      <div className="dashboard-hero flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Welcome back, {user?.name || 'Developer'}!
          </h1>
          <p className="mb-0 text-[var(--color-text-secondary)]">
            Here's what's happening with your developer journey
          </p>
        </div>
        <Link to="/profile/edit">
          <Button icon={Settings} variant="outline">
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/projects/new">
              <Button variant="outline" fullWidth icon={Plus} iconPosition="top">
                Add Project
              </Button>
            </Link>
            <Link to="/developers">
              <Button variant="outline" fullWidth icon={Search} iconPosition="top">
                Find Developers
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" fullWidth icon={Briefcase} iconPosition="top">
                Browse Jobs
              </Button>
            </Link>
            <Link to="/connections">
              <Button variant="outline" fullWidth icon={Users} iconPosition="top">
                My Connections
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Completion */}
      {completionPercentage < 100 && (
        <Card className="dashboard-completion" hover gradient animated>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full opacity-20 blur-lg animate-pulse" />
                  <Settings className="relative h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  Complete Your Profile
                </h3>
              </div>
              <Badge variant="secondary" className="text-sm font-bold">{completionPercentage}%</Badge>
            </div>
            
            {/* Enhanced progress bar */}
            <div className="relative h-3 bg-[var(--color-gray-200)] rounded-full overflow-hidden mb-4 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] transition-all duration-700 ease-out relative rounded-full"
                style={{ width: `${completionPercentage}%` }}
              >
                {/* Shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer" />
              </div>
            </div>
            
            <Link to="/onboarding">
              <Button size="sm" fullWidth variant="gradient" icon={ArrowRight} iconPosition="right">
                Continue Setup
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Overview */}
      <div className="dashboard-stats grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { 
            icon: Users, 
            value: profile?.connections || 0, 
            label: 'Connections',
            color: 'var(--color-primary)',
            gradient: 'from-[var(--color-primary)] to-[var(--color-primary-light)]'
          },
          { 
            icon: Code2, 
            value: featuredProjects?.projects?.length || 0, 
            label: 'Projects',
            color: 'var(--color-secondary)',
            gradient: 'from-[var(--color-secondary)] to-[var(--color-secondary-light)]'
          },
          { 
            icon: Bell, 
            value: notifications?.unreadCount || 0, 
            label: 'Notifications',
            color: 'var(--color-accent)',
            gradient: 'from-[var(--color-accent)] to-[var(--color-accent-light)]'
          },
          { 
            icon: Briefcase, 
            value: 3, 
            label: 'Job Matches',
            color: 'var(--color-warning)',
            gradient: 'from-[var(--color-warning)] to-[var(--color-warning-light)]'
          }
        ].map((stat, index) => (
          <Card key={index} hover animated shadow="lg" className="dashboard-stat-card group/stat">
            <CardContent className="text-center relative overflow-hidden">
              {/* Background glow effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover/stat:opacity-10 transition-opacity duration-300`} 
              />
              
              {/* Icon with animation */}
              <div className="relative mb-3">
                <div 
                  className="absolute inset-0 rounded-full blur-xl animate-pulse-soft"
                  style={{ background: stat.color }}
                />
                <div className="relative inline-flex p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/20">
                  <stat.icon 
                    className="h-6 w-6 transition-transform group-hover/stat:scale-110 group-hover/stat:-translate-y-1" 
                    style={{ color: stat.color }} 
                  />
                </div>
              </div>
              
              {/* Value with counter animation */}
              <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] font-medium">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="dashboard-panels grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Pending Connection Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton variant="card" />
            ) : pendingRequests?.requests?.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.requests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 bg-[var(--color-gray-50)] rounded-lg">
                    <Avatar size="sm" fallback={request.from?.name?.[0]} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {request.from?.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {request.from?.headline}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="success">
                        Accept
                      </Button>
                      <Button size="sm" variant="ghost">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
                <Link to="/connections/requests">
                  <Button variant="ghost" size="sm" fullWidth icon={ArrowRight} iconPosition="right">
                    View All
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon="default"
                title="No pending requests"
                description="You don't have any pending connection requests"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Recommended Developers */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Developers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton variant="card" />
            ) : recommended?.developers?.length > 0 ? (
              <div className="space-y-3">
                {recommended.developers.slice(0, 3).map((developer) => (
                  <div key={developer.id} className="flex items-center gap-3 p-3 hover:bg-[var(--color-gray-50)] rounded-lg cursor-pointer transition-colors">
                    <Avatar size="sm" fallback={developer.name?.[0]} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {developer.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {developer.headline}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                ))}
                <Link to="/developers">
                  <Button variant="ghost" size="sm" fullWidth icon={Search} iconPosition="right">
                  Discover More
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon="default"
                title="No recommendations yet"
                description="Connect with more developers to get personalized recommendations"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton variant="card" />
            ) : notifications?.notifications?.length > 0 ? (
              <div className="space-y-3">
                {notifications.notifications.slice(0, 4).map((notification) => (
                  <div key={notification.id} className="p-3 hover:bg-[var(--color-gray-50)] rounded-lg cursor-pointer transition-colors">
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {notification.message}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                      {notification.createdAt}
                    </p>
                  </div>
                ))}
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" fullWidth icon={Bell} iconPosition="right">
                    View All
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon="default"
                title="No notifications"
                description="You're all caught up on notifications"
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Featured Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Featured Projects</CardTitle>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          ) : featuredProjects?.projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredProjects.projects.slice(0, 3).map((project) => (
                <Card key={project.id} hover>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex gap-2 mb-3">
                      {project.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                      <span>★ {project.stars}</span>
                      <span>⑂ {project.forks}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="default"
              title="No featured projects"
              description="Check back later for featured projects from the community"
            />
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
