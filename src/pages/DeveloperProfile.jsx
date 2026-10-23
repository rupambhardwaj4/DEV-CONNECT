import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, LoadingSkeleton, EmptyState } from '../components/common';
import { MapPin, Briefcase, Link2, GitBranch, Calendar, Code2, Users, Star } from 'lucide-react';
import { developersService, connectionsService } from '../services';

export function DeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const [profileData, statusData] = await Promise.all([
          developersService.getDeveloperById(id),
          connectionsService.getConnectionStatus(id),
        ]);
        
        setProfile(profileData);
        setConnectionStatus(statusData);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [id]);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      await connectionsService.sendRequest(id);
      setConnectionStatus({ status: 'pending', canRequest: false });
    } catch (err) {
      setError(err.message || 'Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleSendMessage = () => {
    navigate('/messages/new', { state: { recipientId: id, recipientName: profile?.name } });
  };
  
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
          <Button variant="outline" className="mt-4" onClick={() => navigate('/developers')}>
            Back to Developers
          </Button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon="users"
          title="Profile not found"
          description="This developer profile doesn't exist or has been removed"
        />
      </div>
    );
  }
  
  const isOwnProfile = false; // In real app, compare with current user ID
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar size="xl" fallback={profile.name?.[0] || '?'} />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    {profile.name}
                    {profile.isVerified && (
                      <Badge variant="success" size="sm">Verified</Badge>
                    )}
                  </h1>
                  <p className="text-lg text-[var(--color-text-secondary)]">{profile.headline}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location || 'No location'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {profile.connections || 0} connections
                    </div>
                  </div>
                </div>
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    {connectionStatus?.status === 'connected' ? (
                      <>
                        <Button variant="outline" onClick={handleSendMessage}>
                          Message
                        </Button>
                        <Button variant="danger" size="sm">
                          Disconnect
                        </Button>
                      </>
                    ) : connectionStatus?.status === 'pending' ? (
                      <Button variant="outline" disabled>
                        Request Sent
                      </Button>
                    ) : (
                      <Button
                        onClick={handleConnect}
                        loading={isConnecting}
                        disabled={isConnecting || !connectionStatus?.canRequest}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {profile.website && (
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
              
              {profile.githubUsername && (
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
        </CardContent>
      </Card>
      
      {/* About */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-text-secondary)]">{profile.bio}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
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
      )}
      
      {/* Experience */}
      {profile.experience && profile.experience.length > 0 && (
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
      )}
      
      {/* Education */}
      {profile.education && profile.education.length > 0 && (
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
      )}
      
      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.projects.map((project) => (
              <div key={project.id} className="p-4 bg-[var(--color-gray-50)] rounded-lg">
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
          </CardContent>
        </Card>
      )}
      
      {/* Career Preferences */}
      {(profile.jobType || profile.locationPreference || profile.interests) && (
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
      )}
      
      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate('/developers')}>
          Back to Developers
        </Button>
        {!isOwnProfile && connectionStatus?.status === 'connected' && (
          <Button onClick={handleSendMessage}>
            Send Message
          </Button>
        )}
      </div>
    </div>
  );
}
