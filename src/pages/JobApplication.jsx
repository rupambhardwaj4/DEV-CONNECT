import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, LoadingSkeleton } from '../components/common';
import { Upload, ArrowLeft, FileText, X } from 'lucide-react';
import { applicationsService, jobsService } from '../services';

export function JobApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    resume: null,
    coverLetter: '',
  });
  
  const [resumePreview, setResumePreview] = useState(null);
  
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
  
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      
      setFormData(prev => ({ ...prev, resume: file }));
      setResumePreview(file.name);
      setError('');
    }
  };
  
  const handleRemoveResume = () => {
    setFormData(prev => ({ ...prev, resume: null }));
    setResumePreview(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await applicationsService.submitApplication(id, formData);
      setSuccess('Application submitted successfully!');
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  if (error && !job) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(`/jobs/${id}`)}>
        Back to Job
      </Button>
      
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
        Apply for {job?.title}
      </h1>
      
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
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumePreview ? (
              <div className="flex items-center justify-between p-4 bg-[var(--color-gray-50)] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-primary)]">{resumePreview}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={handleRemoveResume}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                  Upload your resume (PDF, DOC, DOCX)
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
                  Maximum file size: 5MB
                </p>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              rows={8}
              maxLength={2000}
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {formData.coverLetter.length}/2000 characters
            </p>
          </CardContent>
        </Card>
        
        <div className="flex gap-4">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Submit Application
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/jobs/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
