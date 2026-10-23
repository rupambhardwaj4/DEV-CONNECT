import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, SearchBar, Select, Button, Avatar, LoadingSkeleton, EmptyState } from '../components/common';
import { Star, GitFork, Plus, X } from 'lucide-react';
import { projectsService } from '../services';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScrollWithData } from '../hooks/useInfiniteScroll.jsx';

export function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent');
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'devops', label: 'DevOps' },
    { value: 'data-science', label: 'Data Science' },
  ];
  
  const languages = [
    { value: '', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'stars', label: 'Most Stars' },
    { value: 'forks', label: 'Most Forks' },
  ];

  const fetchPage = useCallback(async (pageNum, limit) => {
    const params = {
      page: pageNum,
      limit,
      ...(debouncedSearch && { query: debouncedSearch }),
      ...(category && { category }),
      ...(language && { language }),
      ...(sort && { sort }),
    };
    
    const response = await projectsService.getProjects(params);
    return {
      data: response.projects,
      total: response.total,
    };
  }, [debouncedSearch, category, language, sort]);

  const {
    data: projects,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    fetchNextPage,
    refresh,
    sentinel,
  } = useInfiniteScrollWithData({
    fetchPage,
    getKey: (project) => project.id,
    pageSize: 12,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (category) params.set('category', category);
    if (language) params.set('language', language);
    if (sort) params.set('sort', sort);
    
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, category, language, sort, setSearchParams]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    refresh();
  };
  
  const handleFilterChange = (key, value) => {
    if (key === 'category') setCategory(value);
    if (key === 'language') setLanguage(value);
    if (key === 'sort') setSort(value);
    refresh();
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLanguage('');
    setSort('recent');
    refresh();
  };
  
  const hasActiveFilters = searchTerm || category || language || sort !== 'recent';
  
  const renderProjectCard = (project) => (
    <Card key={project.id} hover>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Avatar size="sm" fallback={project.author?.name?.[0] || '?'} />
          <span className="text-sm text-[var(--color-text-secondary)]">
            {project.author?.name || 'Unknown'}
          </span>
        </div>
        
        <div className="flex gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-[var(--color-warning)]" />
            {project.stars || 0}
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {project.forks || 0}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {project.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
          {(project.tags?.length || 0) > 3 && (
            <Badge variant="gray" size="sm">
              +{(project.tags?.length || 0) - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" fullWidth onClick={() => navigate(`/projects/${project.id}`)}>
          View Project
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Projects
        </h1>
        <Button icon={Plus} onClick={() => navigate('/projects/new')}>
          Add Project
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Filter Projects
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Select
              options={categories}
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
            <Select
              options={languages}
              value={language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
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
      ) : projects.length === 0 ? (
        <EmptyState
          icon="Code2"
          title="No projects found"
          description="Try adjusting your filters or search terms"
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {projects.length} projects found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(renderProjectCard)}
          </div>
          
          <div ref={sentinel} className="flex items-center justify-center py-6">
            {isLoadingMore ? (
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <div className="h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <span>Loading more projects...</span>
              </div>
            ) : hasNextPage ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchNextPage}
                disabled={isLoadingMore}
              >
                Load More Projects
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}