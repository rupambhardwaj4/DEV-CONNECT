import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Avatar, SearchBar, Select, Button, LoadingSkeleton, EmptyState } from '../components/common';
import { MapPin, Briefcase, X } from 'lucide-react';
import { developersService } from '../services';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScrollWithData } from '../hooks/useInfiniteScroll.jsx';

export function Developers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent');
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const skills = [
    { value: '', label: 'All Skills' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];
  
  const locations = [
    { value: '', label: 'All Locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'connections', label: 'Most Connected' },
    { value: 'projects', label: 'Most Projects' },
  ];

  const fetchPage = useCallback(async (pageNum, limit) => {
    const params = {
      page: pageNum,
      limit,
      ...(debouncedSearch && { query: debouncedSearch }),
      ...(skill && { skills: skill }),
      ...(location && { location }),
      ...(sort && { sort }),
    };
    
    const response = await developersService.getDevelopers(params);
    return {
      data: response.developers,
      total: response.total,
    };
  }, [debouncedSearch, skill, location, sort]);

  const {
    data: developers,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    fetchNextPage,
    refresh,
    sentinel,
  } = useInfiniteScrollWithData({
    fetchPage,
    getKey: (dev) => dev.id,
    pageSize: 12,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (skill) params.set('skill', skill);
    if (location) params.set('location', location);
    if (sort) params.set('sort', sort);
    
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, skill, location, sort, setSearchParams]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    refresh();
  };
  
  const handleFilterChange = (key, value) => {
    if (key === 'skill') setSkill(value);
    if (key === 'location') setLocation(value);
    if (key === 'sort') setSort(value);
    refresh();
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setSkill('');
    setLocation('');
    setSort('recent');
    refresh();
  };

  const hasActiveFilters = searchTerm || skill || location || sort !== 'recent';
  
  const total = useMemo(() => {
    if (developers.length === 0) return 0;
    return developers.length + (hasNextPage ? 1 : 0);
  }, [developers.length, hasNextPage]);

  const renderDeveloperCard = (developer) => (
    <Card key={developer.id} hover>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar size="lg" fallback={developer.name?.[0] || '?'} />
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--color-text-primary)]">{developer.name}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{developer.headline}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {developer.skills?.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" size="sm">
              {skill}
            </Badge>
          ))}
          {(developer.skills?.length || 0) > 3 && (
            <Badge variant="gray" size="sm">
              +{(developer.skills?.length || 0) - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {developer.location || 'No location'}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {developer.projectsCount || 0} projects
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            fullWidth 
            size="sm"
            onClick={() => navigate(`/developers/${developer.id}`)}
          >
            View Profile
          </Button>
          <Button fullWidth size="sm">
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Filter Developers
            </h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" icon={X} onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                placeholder="Search by name, skills, or location..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Select
              options={skills}
              value={skill}
              onChange={(e) => handleFilterChange('skill', e.target.value)}
            />
            <Select
              options={locations}
              value={location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : developers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No developers found"
          description="Try adjusting your filters or search terms"
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {developers.length} developers found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map(renderDeveloperCard)}
          </div>
          
          <div ref={sentinel} className="flex items-center justify-center py-6">
            {isLoadingMore ? (
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <div className="h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <span>Loading more developers...</span>
              </div>
            ) : hasNextPage ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchNextPage}
                disabled={isLoadingMore}
              >
                Load More Developers
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}