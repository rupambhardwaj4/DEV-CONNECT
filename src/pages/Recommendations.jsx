import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, LoadingSkeleton, EmptyState } from '../components/common';
import { Sparkles, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { recommendationsService } from '../services';

export function Recommendations() {
  const navigate = useNavigate();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedDevelopers, setRecommendedDevelopers] = useState([]);
  
  useEffect(() => {
    const checkService = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const availability = await recommendationsService.checkAvailability();
        setIsAvailable(availability.available);
        
        if (availability.available) {
          const [jobsData, developersData] = await Promise.all([
            recommendationsService.getRecommendedJobs({ limit: 6 }),
            recommendationsService.getRecommendedDevelopers({ limit: 6 }),
          ]);
          
          setRecommendedJobs(jobsData.jobs);
          setRecommendedDevelopers(developersData.developers);
        }
      } catch (err) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkService();
  }, []);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  if (!isAvailable) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-16 w-16 text-[var(--color-warning)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              AI Recommendations Unavailable
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              The AI-powered recommendation service is not yet available. 
              This feature requires backend AI/ML integration.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
              <Button variant="outline" onClick={() => navigate('/developers')}>
                Browse Developers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-[var(--color-accent)]" />
          AI Recommendations
        </h1>
        <Button variant="outline" icon={RefreshCw}>
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      {/* Recommended Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recommended Jobs</CardTitle>
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/jobs')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendedJobs.length === 0 ? (
            <EmptyState
              icon="Briefcase"
              title="No job recommendations yet"
              description="Complete your profile to get personalized job recommendations"
            />
          ) : (
            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="p-4 bg-[var(--color-gray-50)] rounded-lg hover:bg-[var(--color-gray-100)] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                        {job.company?.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" size="sm">
                        {job.matchScore || 85}% Match
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recommended Developers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recommended Developers</CardTitle>
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/developers')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendedDevelopers.length === 0 ? (
            <EmptyState
              icon="users"
              title="No developer recommendations yet"
              description="Add more skills to your profile to get better recommendations"
            />
          ) : (
            <div className="space-y-4">
              {recommendedDevelopers.map((developer) => (
                <div key={developer.id} className="p-4 bg-[var(--color-gray-50)] rounded-lg hover:bg-[var(--color-gray-100)] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {developer.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                        {developer.headline}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {developer.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" size="sm">
                        {developer.matchScore || 90}% Match
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
