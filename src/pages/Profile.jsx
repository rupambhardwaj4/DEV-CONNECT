import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Avatar } from '../components/common';
import { MapPin, Mail, Link as LinkIcon, GitBranch, X, Edit2 } from 'lucide-react';

export function Profile() {
  const user = {
    name: 'John Doe',
    role: 'Senior Full Stack Developer',
    location: 'San Francisco, CA',
    email: 'john@example.com',
    website: 'johndoe.dev',
    bio: 'Passionate developer with 5+ years of experience building web applications. Love open source and helping others learn.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL'],
    github: 'johndoe',
    twitter: 'johndoe',
  };
  
  const projects = [
    { id: 1, name: 'Awesome Project', description: 'A cool project built with React', stars: 120, forks: 30 },
    { id: 2, name: 'Another Project', description: 'Another awesome project', stars: 85, forks: 15 },
  ];
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar size="xl" fallback="JD" />
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{user.name}</h1>
                  <p className="text-[var(--color-text-secondary)]">{user.role}</p>
                </div>
                <Button variant="outline" icon={Edit2} size="sm">
                  Edit Profile
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  {user.website}
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                  <GitBranch className="h-5 w-5" />
                </a>
                <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                  <X className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">About</h3>
            <p className="text-[var(--color-text-secondary)]">{user.bio}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Projects Section */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} hover>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--color-warning)]">★</span>
                    {project.stars}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    {project.forks}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" fullWidth>
                  View Project
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
