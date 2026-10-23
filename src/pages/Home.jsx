import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Avatar } from '../components/common';
import { Users, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';

export function Home() {
  const featuredDevelopers = [
    { id: 1, name: 'Sarah Chen', role: 'Full Stack Developer', skills: ['React', 'Node.js', 'TypeScript'], avatar: 'SC' },
    { id: 2, name: 'Alex Johnson', role: 'Frontend Engineer', skills: ['Vue.js', 'React', 'CSS'], avatar: 'AJ' },
    { id: 3, name: 'Maria Garcia', role: 'Backend Developer', skills: ['Python', 'Django', 'PostgreSQL'], avatar: 'MG' },
  ];
  
  const featuredJobs = [
    { id: 1, title: 'Senior React Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time' },
    { id: 2, title: 'Frontend Engineer', company: 'StartupXYZ', location: 'San Francisco', type: 'Full-time' },
    { id: 3, title: 'Full Stack Developer', company: 'DevStudio', location: 'New York', type: 'Contract' },
  ];
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
          Connect with Developers
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
          Join the community where developers showcase their work, find opportunities, and build meaningful connections.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">Learn More</Button>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg">
          <CardContent className="text-center">
            <Users className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[var(--color-text-primary)]">10K+</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Active Developers</div>
          </CardContent>
        </Card>
        
        <Card padding="lg">
          <CardContent className="text-center">
            <Briefcase className="h-8 w-8 text-[var(--color-secondary)] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[var(--color-text-primary)]">5K+</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Projects Shared</div>
          </CardContent>
        </Card>
        
        <Card padding="lg">
          <CardContent className="text-center">
            <TrendingUp className="h-8 w-8 text-[var(--color-accent)] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[var(--color-text-primary)]">2K+</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Jobs Posted</div>
          </CardContent>
        </Card>
      </section>
      
      {/* Featured Developers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Featured Developers</h2>
          <Button variant="ghost" icon={ArrowRight} iconPosition="right">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDevelopers.map((developer) => (
            <Card key={developer.id} hover>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar size="lg" fallback={developer.avatar} />
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">{developer.name}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{developer.role}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {developer.skills.map((skill) => (
                    <Badge key={skill} variant="outline" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Featured Jobs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Featured Jobs</h2>
          <Button variant="ghost" icon={ArrowRight} iconPosition="right">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <Card key={job.id} hover>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" size="sm">{job.type}</Badge>
                  <Badge variant="outline" size="sm">{job.location}</Badge>
                </div>
                <Button variant="outline" fullWidth>
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
