import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Badge, Avatar, LoadingSkeleton, Select } from '../components/common';
import { Camera, Save, X, MapPin, Briefcase, Code2, Heart } from 'lucide-react';
import { developersService } from '../services';

export function ProfileEdit() {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    headline: '',
    location: '',
    bio: '',
    website: '',
    githubUsername: '',
    skills: [],
    jobType: '',
    locationPreference: '',
    interests: [],
  });
  
  const [newSkill, setNewSkill] = useState('');
  
  const skillOptions = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby', 'C#', 'C++',
    'Swift', 'Kotlin', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  ];
  
  const jobTypes = [
    { value: '', label: 'No preference' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
  ];
  
  const locationPreferences = [
    { value: '', label: 'No preference' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];
  
  const interests = [
    'Open Source', 'Mentorship', 'Hackathons', 'Tech Talks',
    'Side Projects', 'Startups', 'Enterprise', 'Research',
  ];
  
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await developersService.getCurrentProfile();
        setFormData({
          name: data.name || '',
          username: data.username || '',
          headline: data.headline || '',
          location: data.location || '',
          bio: data.bio || '',
          website: data.website || '',
          githubUsername: data.githubUsername || '',
          skills: data.skills || [],
          jobType: data.jobType || '',
          locationPreference: data.locationPreference || '',
          interests: data.interests || [],
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }));
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };
  
  const handleToggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await developersService.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Edit Profile
        </h1>
        <Button variant="ghost" onClick={() => navigate('/profile')}>
          Cancel
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)] rounded-lg">
          <p className="text-[var(--color-success)]">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <Avatar size="xl" fallback={formData.name?.[0] || '?'} />
              <div>
                <Button variant="outline" size="sm" icon={Camera}>
                  Change Photo
                </Button>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
            </div>
            
            <Input
              label="Headline"
              placeholder="e.g., Full Stack Developer at Tech Company"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
            />
            
            <Input
              label="Location"
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              icon={MapPin}
            />
            
            <Input
              label="Website"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
            
            <Input
              label="GitHub Username"
              placeholder="e.g., johndoe"
              value={formData.githubUsername}
              onChange={(e) => handleInputChange('githubUsername', e.target.value)}
              icon={Code2}
            />
          </CardContent>
        </Card>
        
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={6}
              maxLength={500}
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {formData.bio.length}/500 characters
            </p>
          </CardContent>
        </Card>
        
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select
                options={skillOptions.map(s => ({ value: s, label: s }))}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Select a skill"
              />
              <Button type="button" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="outline" size="md">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-[var(--color-error)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Career Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Career Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Job Type"
                options={jobTypes}
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
                icon={Briefcase}
              />
              <Select
                label="Location Preference"
                options={locationPreferences}
                value={formData.locationPreference}
                onChange={(e) => handleInputChange('locationPreference', e.target.value)}
                icon={MapPin}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? 'primary' : 'outline'}
                    size="md"
                    className="cursor-pointer"
                    onClick={() => handleToggleInterest(interest)}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" icon={Save} loading={isSaving} disabled={isSaving}>
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
