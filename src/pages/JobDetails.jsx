import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, LoadingSkeleton, EmptyState } from '../components/common';
import { MapPin, Clock, Building2, Calendar, ArrowLeft, Bookmark, BookmarkCheck, User } from 'lucide-react';
import { jobsService } from '../services';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await jobsService.getJobById(id);
        setJob(data);
      } catch (err) {
        setError(err.message || 'Failed to load job');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJob();
  }, [id]);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (isSaved) {
        await jobsService.unsaveJob(id);
        setIsSaved(false);
      } else {
        await jobsService.saveJob(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to save/unsave job:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleApply = () => {
    navigate(`/jobs/${id}/apply`);
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
          <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon="Briefcase"
          title="Job not found"
          description="This job may have been removed or is no longer available"
          action={
            <Button onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
          }
        />
      </div>
    );
  }
  
  if (job.status === 'closed') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              This position is closed
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              This job is no longer accepting applications
            </p>
            <Button onClick={() => navigate('/jobs')}>
              Browse Other Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/jobs')}>
        Back to Jobs
      </Button>
      
      {/* Job Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {job.company?.name?.[0] || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-lg text-[var(--color-text-secondary)] mb-3">
                <Building2 className="h-5 w-5" />
                {job.company?.name || 'Unknown Company'}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location || 'Not specified'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.type || 'Not specified'}
                </div>
                {job.remote && (
                  <Badge variant="secondary">Remote</Badge>
                )}
                {job.experience && (
                  <Badge variant="outline">{job.experience}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button
              onClick={handleApply}
              disabled={false}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              icon={isSaved ? BookmarkCheck : Bookmark}
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)]">
            <p>{job.description || 'No description provided'}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)]">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)]">
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="outline" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {job.postedAt && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Calendar className="h-4 w-4" />
              <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
          )}
          {job.deadline && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Calendar className="h-4 w-4" />
              <span>Application Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          )}
          {job.applicants !== undefined && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <User className="h-4 w-4" />
              <span>{job.applicants} applicants</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
