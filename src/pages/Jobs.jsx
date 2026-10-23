import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, SearchBar, Select, LoadingSkeleton, EmptyState } from '../components/common';
import { MapPin, Clock, Building2, Bookmark, BookmarkCheck, X } from 'lucide-react';
import { jobsService } from '../services';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScrollWithData } from '../hooks/useInfiniteScroll.jsx';

export function Jobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [jobType, setJobType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [remote, setRemote] = useState(searchParams.get('remote') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent');
  
  const [savedJobs, setSavedJobs] = useState(new Set());
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
  ];
  
  const locations = [
    { value: '', label: 'All Locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];
  
  const remoteOptions = [
    { value: '', label: 'Any' },
    { value: 'true', label: 'Remote Only' },
    { value: 'false', label: 'On-site Only' },
  ];
  
  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'deadline', label: 'Deadline Soon' },
    { value: 'applicants', label: 'Most Applicants' },
  ];

  const fetchPage = useCallback(async (pageNum, limit) => {
    const params = {
      page: pageNum,
      limit,
      ...(debouncedSearch && { query: debouncedSearch }),
      ...(jobType && { type: jobType }),
      ...(location && { location }),
      ...(remote && { remote: remote === 'true' }),
      ...(experience && { experience }),
      ...(sort && { sort }),
    };
    
    const response = await jobsService.getJobs(params);
    return {
      data: response.jobs,
      total: response.total,
    };
  }, [debouncedSearch, jobType, location, remote, experience, sort]);

  const {
    data: jobs,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    fetchNextPage,
    refresh,
    sentinel,
  } = useInfiniteScrollWithData({
    fetchPage,
    getKey: (job) => job.id,
    pageSize: 20,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (jobType) params.set('type', jobType);
    if (location) params.set('location', location);
    if (remote) params.set('remote', remote);
    if (experience) params.set('experience', experience);
    if (sort) params.set('sort', sort);
    
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, jobType, location, remote, experience, sort, setSearchParams]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    refresh();
  };
  
  const handleFilterChange = (key, value) => {
    if (key === 'jobType') setJobType(value);
    if (key === 'location') setLocation(value);
    if (key === 'remote') setRemote(value);
    if (key === 'experience') setExperience(value);
    if (key === 'sort') setSort(value);
    refresh();
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setJobType('');
    setLocation('');
    setRemote('');
    setExperience('');
    setSort('recent');
    refresh();
  };

  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobs.has(jobId)) {
        await jobsService.unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await jobsService.saveJob(jobId);
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Failed to save/unsave job:', err);
    }
  };
  
  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const hasActiveFilters = searchTerm || jobType || location || remote || experience || sort !== 'recent';
  
  const renderJobCard = (job) => (
    <Card key={job.id} hover>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {job.company?.name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-2">
                  <Building2 className="h-4 w-4" />
                  {job.company?.name || 'Unknown Company'}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-secondary)] mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location || 'Not specified'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.type || 'Not specified'}
                  </div>
                  {job.remote && (
                    <Badge variant="secondary" size="sm">Remote</Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {(job.skills?.length || 0) > 4 && (
                    <Badge variant="gray" size="sm">
                      +{(job.skills?.length || 0) - 4}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex md:flex-col gap-2">
            <Button onClick={() => handleViewJob(job.id)}>
              View Details
            </Button>
            <Button
              variant="outline"
              icon={savedJobs.has(job.id) ? BookmarkCheck : Bookmark}
              onClick={() => handleSaveJob(job.id)}
            >
              {savedJobs.has(job.id) ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
        Jobs
      </h1>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Filter Jobs
            </h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" icon={X} onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <SearchBar
                placeholder="Search by title, company, or keywords..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Select
              options={jobTypes}
              value={jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
            />
            <Select
              options={locations}
              value={location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
            <Select
              options={remoteOptions}
              value={remote}
              onChange={(e) => handleFilterChange('remote', e.target.value)}
            />
            <Select
              options={experienceLevels}
              value={experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            />
            <Select
              options={sortOptions}
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      ) : error ? (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
          <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
            Try Again
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="Briefcase"
          title="No jobs found"
          description="Try adjusting your filters or search terms"
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {jobs.length} jobs found
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {jobs.map(renderJobCard)}
          </div>
          
          <div ref={sentinel} className="flex items-center justify-center py-6">
            {isLoadingMore ? (
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <div className="h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <span>Loading more jobs...</span>
              </div>
            ) : hasNextPage ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchNextPage}
                disabled={isLoadingMore}
              >
                Load More Jobs
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}