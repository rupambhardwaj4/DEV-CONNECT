import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Badge, LoadingSkeleton, Select } from '../components/common';
import { Save, X, ExternalLink, Trash2 } from 'lucide-react';
import { projectsService } from '../services';

export function ProjectEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    demoUrl: '',
    tags: [],
    language: '',
    featured: false,
  });
  
  const [newTag, setNewTag] = useState('');
  
  const languages = [
    { value: '', label: 'Select Language' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
  ];
  
  const commonTags = [
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django',
    'Flask', 'Spring', 'ASP.NET', 'Rails', 'Laravel',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
    'Mobile', 'Web', 'Desktop', 'API', 'CLI',
  ];
  
  useEffect(() => {
    if (isEditing) {
      const loadProject = async () => {
        setIsLoading(true);
        setError('');
        
        try {
          const data = await projectsService.getProjectById(id);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            repositoryUrl: data.repositoryUrl || '',
            demoUrl: data.demoUrl || '',
            tags: data.tags || [],
            language: data.language || '',
            featured: data.featured || false,
          });
        } catch (err) {
          setError(err.message || 'Failed to load project');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadProject();
    }
  }, [id, isEditing]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };
  
  const handleCommonTagClick = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      if (isEditing) {
        await projectsService.updateProject(id, formData);
        setSuccess('Project updated successfully!');
      } else {
        await projectsService.createProject(formData);
        setSuccess('Project created successfully!');
      }
      
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await projectsService.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
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
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Project Title"
              placeholder="e.g., My Awesome App"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
            
            <Textarea
              label="Description"
              placeholder="Describe your project, its purpose, and key features..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              required
              maxLength={1000}
            />
            <p className="text-xs text-[var(--color-text-secondary)]">
              {formData.description.length}/1000 characters
            </p>
            
            <Input
              label="Repository URL"
              placeholder="https://github.com/username/repo"
              value={formData.repositoryUrl}
              onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
              icon={ExternalLink}
            />
            {formData.repositoryUrl && !isValidUrl(formData.repositoryUrl) && (
              <p className="text-xs text-[var(--color-error)]">Please enter a valid URL</p>
            )}
            
            <Input
              label="Live Demo URL"
              placeholder="https://myproject-demo.com"
              value={formData.demoUrl}
              onChange={(e) => handleInputChange('demoUrl', e.target.value)}
              icon={ExternalLink}
            />
            {formData.demoUrl && !isValidUrl(formData.demoUrl) && (
              <p className="text-xs text-[var(--color-error)]">Please enter a valid URL</p>
            )}
            
            <Select
              label="Primary Language"
              options={languages}
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select
                options={commonTags.map(t => ({ value: t, label: t }))}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Select a tag"
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline" size="md">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-[var(--color-error)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Common Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? 'primary' : 'outline'}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleCommonTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">
                Feature this project on your profile
              </span>
            </label>
          </CardContent>
        </Card>
        
        <div className="flex gap-4">
          <Button type="submit" icon={Save} loading={isSaving} disabled={isSaving}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Project
            </Button>
          )}
        </div>
      </form>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Delete Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--color-text-secondary)]">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  icon={Trash2}
                  loading={isDeleting}
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
