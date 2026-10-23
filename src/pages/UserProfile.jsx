import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, LoadingSkeleton, EmptyState } from '../components/common';
import { MapPin, Briefcase, Link2, GitBranch, Calendar, Code2, Users, Star, Settings, Plus } from 'lucide-react';
import { developersService, projectsService } from '../services';

export function UserProfile() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const [profileData, projectsData] = await Promise.all([
          developersService.getCurrentProfile(),
          projectsService.getMyProjects({ limit: 6 }),
        ]);
        
        setProfile(profileData);
        setProjects(projectsData.projects || []);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      </div>
    );
  }
  
  const completionPercentage = profile?.completionPercentage || 0;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar size="xl" fallback={profile?.name?.[0] || '?'} />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    {profile?.name}
                    {profile?.isVerified && (
                      <Badge variant="success" size="sm">Verified</Badge>
                    )}
                  </h1>
                  <p className="text-lg text-[var(--color-text-secondary)]">{profile?.headline}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile?.location || 'No location'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {profile?.connections || 0} connections
                    </div>
                  </div>
                </div>
                <Button variant="outline" icon={Settings} onClick={() => navigate('/profile/edit')}>
                  Edit Profile
                </Button>
              </div>
              
              {profile?.website && (
                <div className="flex items-center gap-2 mt-4">
                  <Link2 className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              
              {profile?.githubUsername && (
                <div className="flex items-center gap-2 mt-2">
                  <GitBranch className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    {profile.githubUsername}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Completion */}
          {completionPercentage < 100 && (
            <div className="mt-6 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Profile Completion
                </span>
                <Badge variant="primary">{completionPercentage}%</Badge>
              </div>
              <div className="h-2 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                Complete your profile to get more visibility and better matches
              </p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/onboarding')}>
                Continue Setup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* About */}
      {profile?.bio ? (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-text-secondary)]">{profile.bio}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="user"
              title="No bio yet"
              description="Add a bio to tell others about yourself"
              action={
                <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                  Add Bio
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
      
      {/* Skills */}
      {profile?.skills && profile.skills.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="outline" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="Code2"
              title="No skills added"
              description="Add your technical skills to showcase your expertise"
              action={
                <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                  Add Skills
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
      
      {/* Experience */}
      {profile?.experience && profile.experience.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-[var(--color-gray-200)] pl-4">
                <h3 className="font-semibold text-[var(--color-text-primary)]">{exp.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{exp.company}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-tertiary)]">
                  <Calendar className="h-3 w-3" />
                  {exp.startDate} - {exp.endDate || 'Present'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="Briefcase"
              title="No experience added"
              description="Add your work experience to build your professional profile"
              action={
                <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                  Add Experience
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
      
      {/* Education */}
      {profile?.education && profile.education.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-[var(--color-gray-200)] pl-4">
                <h3 className="font-semibold text-[var(--color-text-primary)]">{edu.degree}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{edu.school}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-tertiary)]">
                  <Calendar className="h-3 w-3" />
                  {edu.year}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="GraduationCap"
              title="No education added"
              description="Add your education to complete your profile"
              action={
                <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                  Add Education
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
      
      {/* Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <Button variant="outline" size="sm" icon={Plus} onClick={() => navigate('/projects/new')}>
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="p-4 bg-[var(--color-gray-50)] rounded-lg hover:bg-[var(--color-gray-100)] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">{project.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] ml-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {project.stars || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Code2 className="h-4 w-4" />
                        {project.forks || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" fullWidth onClick={() => navigate('/projects')}>
                View All Projects
              </Button>
            </div>
          ) : (
            <EmptyState
              icon="Code2"
              title="No projects yet"
              description="Showcase your work by adding projects to your profile"
              action={
                <Button icon={Plus} onClick={() => navigate('/projects/new')}>
                  Add Your First Project
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
      
      {/* Career Preferences */}
      {(profile?.jobType || profile?.locationPreference || profile?.interests) ? (
        <Card>
          <CardHeader>
            <CardTitle>Career Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.jobType && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Looking for: <span className="font-medium">{profile.jobType}</span>
                </span>
              </div>
            )}
            {profile.locationPreference && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Preference: <span className="font-medium">{profile.locationPreference}</span>
                </span>
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" size="sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="Briefcase"
              title="No career preferences set"
              description="Set your preferences to find better job matches"
              action={
                <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                  Set Preferences
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
