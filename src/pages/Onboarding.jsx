import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge, Select } from '../components/common';
import { ArrowLeft, ArrowRight, CheckCircle, User, Code2, Briefcase, Save, Loader2, Sparkles } from 'lucide-react';
import { authService } from '../services/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEY = 'devconnect-onboarding-progress';

const steps = [
  { id: 'basic', title: 'Basic Info', icon: User, description: 'Your name, location, and website' },
  { id: 'bio', title: 'About You', icon: User, description: 'Write a short bio about yourself' },
  { id: 'skills', title: 'Skills', icon: Code2, description: 'Select your technical skills' },
  { id: 'github', title: 'GitHub', icon: Code2, description: 'Connect your GitHub account' },
  { id: 'preferences', title: 'Preferences', icon: Briefcase, description: 'Job and work preferences' },
];

const sampleSkills = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js', 'Python',
  'Java', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'SQL', 'MongoDB',
  'GraphQL', 'REST API', 'Git', 'CI/CD', 'Testing',
];

const initialFormData = {
  name: '',
  location: '',
  website: '',
  bio: '',
  skills: [],
  githubUsername: '',
  jobType: '',
  remotePreference: '',
  interests: [],
};

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const saveTimeoutRef = useRef(null);
  const [lastSaved, setLastSaved] = useState(null);

  const [savedProgress, setSavedProgress] = useLocalStorage(STORAGE_KEY, null);

  const [formData, setFormData] = useState(() => {
    if (savedProgress) {
      setCompletedSteps(new Set(savedProgress.completedSteps || []));
      return { ...initialFormData, ...savedProgress.formData };
    }
    return initialFormData;
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const saveProgress = useCallback(async (showIndicator = false) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const progress = {
      formData,
      currentStep,
      completedSteps: Array.from(completedSteps),
      lastUpdated: Date.now(),
    };

    setSavedProgress(progress);
    
    if (showIndicator) {
      setIsSaving(true);
      setShowSaveIndicator(true);
      setLastSaved(new Date());
      
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        setShowSaveIndicator(false);
      }, 1500);
    }
  }, [formData, currentStep, completedSteps, setSavedProgress]);

  useEffect(() => {
    saveProgress(false);
  }, [formData, currentStep, saveProgress]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setError('');
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    
    switch (step.id) {
      case 'basic':
        if (!formData.name.trim()) {
          setError('Please enter your name');
          return false;
        }
        break;
      case 'bio':
        if (!formData.bio.trim()) {
          setError('Please write a short bio');
          return false;
        }
        break;
      case 'skills':
        if (formData.skills.length === 0) {
          setError('Please select at least one skill');
          return false;
        }
        break;
      default:
        break;
    }
    
    setError('');
    return true;
  };

  const markStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, steps[stepIndex].id]));
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    markStepComplete(currentStep);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authService.updateProfile(formData);
      setSavedProgress(null);
      setCompletedSteps(new Set());
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex <= currentStep || completedSteps.has(steps[stepIndex].id)) {
      setCurrentStep(stepIndex);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const isComplete = completedSteps.has(step.id);
    
    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-4">
            <Input
              name="name"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
            <Input
              name="location"
              label="Location"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={handleChange}
            />
            <Input
              name="website"
              label="Website (Optional)"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={handleChange}
              type="url"
            />
          </div>
        );
      
      case 'bio':
        return (
          <div className="space-y-4">
            <Textarea
              name="bio"
              label="About You"
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              value={formData.bio}
              onChange={handleChange}
              rows={6}
              required
            />
            <div className="text-xs text-[var(--color-text-tertiary)] text-right">
              {formData.bio.length} / 500 characters
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Select the technologies and skills you work with:
              </p>
              <span className="text-xs text-[var(--color-primary)] font-medium">
                {formData.skills.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.skills.includes(skill) ? 'primary' : 'outline'}
                  size="md"
                  className="cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" size="sm" className="cursor-pointer" onClick={() => toggleSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'github':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Input
                name="githubUsername"
                label="GitHub Username (Optional)"
                placeholder="johndoe"
                value={formData.githubUsername}
                onChange={handleChange}
                icon={<span className="h-4 w-4">🐙</span>}
              />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              We'll use this to automatically import your repositories and contributions.
            </p>
            <div className="p-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                <span>Auto-fetch your top repos, stars, and contribution stats</span>
              </div>
            </div>
          </div>
        );
      
      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Job Type Preference
              </label>
              <div className="space-y-2">
                {['full-time', 'contract', 'freelance'].map((type) => (
                  <label key={type} className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5">
                    <input
                      type="radio"
                      name="jobType"
                      value={type}
                      checked={formData.jobType === type}
                      onChange={handleChange}
                      className="w-4 h-4 text-[var(--color-primary)]"
                    />
                    <span className="capitalize text-[var(--color-text-primary)]">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Work Location Preference
              </label>
              <div className="space-y-2">
                {['remote', 'hybrid', 'on-site'].map((pref) => (
                  <label key={pref} className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5">
                    <input
                      type="radio"
                      name="remotePreference"
                      value={pref}
                      checked={formData.remotePreference === pref}
                      onChange={handleChange}
                      className="w-4 h-4 text-[var(--color-primary)]"
                    />
                    <span className="capitalize text-[var(--color-text-primary)]">{pref}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Interests (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {['open-source', 'mentoring', 'collaboration', 'networking'].map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? 'primary' : 'outline'}
                    size="md"
                    className="cursor-pointer"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepProgress = () => {
    let completed = 0;
    steps.forEach((step, index) => {
      if (completedSteps.has(step.id) || index < currentStep) {
        completed++;
      }
    });
    return Math.round((completed / steps.length) * 100);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4">
      <div className="container max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Complete Your Profile
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {steps[currentStep].description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {showSaveIndicator && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-success)] bg-[var(--color-success)]/10 px-2.5 py-1 rounded-full animate-fade-in">
                  <Save className="h-3 w-3" />
                  <span>Saved</span>
                </div>
              )}
              <div className="w-32 h-2 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[var(--color-text-primary)] w-10 text-right">
                {getStepProgress()}%
              </span>
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 shrink-0" onClick={() => goToStep(index)} style={{ cursor: index <= currentStep || completedSteps.has(step.id) ? 'pointer' : 'not-allowed' }}>
                <div className="relative">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${completedSteps.has(step.id) 
                      ? 'bg-[var(--color-success)] text-white' 
                      : index === currentStep 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'bg-[var(--color-gray-200)] text-[var(--color-text-tertiary)]'
                    }
                  `}>
                    {completedSteps.has(step.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-4 left-8 w-16 h-0.5 -ml-8 ${completedSteps.has(step.id) ? 'bg-[var(--color-success)]' : 'bg-[var(--color-gray-200)]'}`} />
                  )}
                </div>
                <span className={`hidden sm:block text-xs font-medium ${completedSteps.has(step.id) || index === currentStep ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 text-[var(--color-primary)]" })}
              </div>
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)]">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg text-sm text-[var(--color-error)] flex items-center gap-2 animate-fade-up">
                <span>⚠</span>
                {error}
              </div>
            )}
            
            {renderStep()}
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0 || isLoading}
                icon={ArrowLeft}
              >
                Back
              </Button>
              
              <div className="flex gap-3">
                {currentStep < steps.length - 1 && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isLoading}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  loading={isLoading}
                  disabled={isLoading}
                  icon={currentStep === steps.length - 1 ? CheckCircle : ArrowRight}
                  iconPosition="right"
                  className="gap-2"
                >
                  {currentStep === steps.length - 1 ? 'Complete Profile' : 'Next'}
                  {isSaving && !isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </Button>
              </div>
            </div>
            
            {/* Auto-save indicator */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>Auto-saving your progress...</span>
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Help text */}
        <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-6">
          Your progress is automatically saved. You can close this page and continue later.
        </p>
      </div>
    </div>
  );
}