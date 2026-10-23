import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, LoadingSkeleton, EmptyState, Tabs } from '../components/common';
import { Calendar, ExternalLink } from 'lucide-react';
import { applicationsService } from '../services';

export function MyApplications() {
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'shortlisted', label: 'Shortlisted' },
  ];
  
  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await applicationsService.getApplications();
        setApplications(response.applications);
      } catch (err) {
        setError(err.message || 'Failed to fetch applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApplications();
  }, []);
  
  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };
  
  const handleWithdraw = async (applicationId) => {
    try {
      await applicationsService.withdrawApplication(applicationId);
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err) {
      console.error('Failed to withdraw application:', err);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { variant: 'secondary', label: 'Submitted' },
      under_review: { variant: 'primary', label: 'Under Review' },
      shortlisted: { variant: 'success', label: 'Shortlisted' },
      interview_scheduled: { variant: 'primary', label: 'Interview' },
      rejected: { variant: 'danger', label: 'Rejected' },
      withdrawn: { variant: 'gray', label: 'Withdrawn' },
      hired: { variant: 'success', label: 'Hired' },
    };
    
    return statusMap[status] || { variant: 'gray', label: status };
  };
  
  const filteredApplications = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
        My Applications
      </h1>
      
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <Card>
        <CardContent className="pt-6">
          {filteredApplications.length === 0 ? (
            <EmptyState
              icon="Briefcase"
              title="No applications found"
              description={activeTab === 'all' ? 'You haven\'t applied to any jobs yet' : `No ${activeTab} applications`}
              action={
                activeTab === 'all' && (
                  <Button onClick={() => navigate('/jobs')}>
                    Browse Jobs
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const statusBadge = getStatusBadge(application.status);
                
                return (
                  <div key={application.id} className="p-4 bg-[var(--color-gray-50)] rounded-lg hover:bg-[var(--color-gray-100)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {application.jobTitle}
                          </h3>
                          <Badge variant={statusBadge.variant} size="sm">
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                          {application.companyName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied: {new Date(application.submittedAt).toLocaleDateString()}
                          </div>
                          {application.updatedAt !== application.submittedAt && (
                            <div className="flex items-center gap-1">
                              Updated: {new Date(application.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={ExternalLink}
                          onClick={() => handleViewJob(application.jobId)}
                        >
                          View Job
                        </Button>
                        {application.status === 'submitted' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleWithdraw(application.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
