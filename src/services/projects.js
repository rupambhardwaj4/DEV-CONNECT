import { ApiError } from './api';
import { demoProjects } from './demoData';

/**
 * Projects Service
 * 
 * Expected Backend Endpoints:
 * - GET /projects - List projects with filters and pagination
 * - GET /projects/:id - Get project by ID
 * - POST /projects - Create new project
 * - PUT /projects/:id - Update project
 * - DELETE /projects/:id - Delete project
 * - POST /projects/:id/feature - Feature/unfeature project
 * - GET /projects/my - Get current user's projects
 * - GET /projects/github - Fetch GitHub repositories
 */

class ProjectsService {
  /**
   * Get projects list with filters and pagination
   * @param {Object} params - { page, limit, tags, language, sort }
   * @returns {Promise<Object>}
   */
  async getProjects(params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/projects', { params });
      
      console.warn('Projects.getProjects: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        projects: demoProjects,
        total: demoProjects.length,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 0,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch projects', 500);
    }
  }

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Object>}
   */
  async getProjectById(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get(`/projects/${id}`);
      
      console.warn('Projects.getProjectById: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return demoProjects.find((project) => project.id === id) || demoProjects[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch project', 500);
    }
  }

  /**
   * Create new project
   * @param {Object} data - Project data
   * @returns {Promise<Object>}
   */
  async createProject(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/projects', data);
      
      console.warn('Projects.createProject: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { ...data, id: 'new-project-id', stars: 0, forks: 0 };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create project', 500);
    }
  }

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Object} data - Project data to update
   * @returns {Promise<Object>}
   */
  async updateProject(id, data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.put(`/projects/${id}`, data);
      
      console.warn('Projects.updateProject: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { ...data, id };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update project', 500);
    }
  }

  /**
   * Delete project
   * @param {string} id - Project ID
   * @returns {Promise<void>}
   */
  async deleteProject(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // await api.delete(`/projects/${id}`);
      
      console.warn('Projects.deleteProject: Backend endpoint not yet implemented.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete project', 500);
    }
  }

  /**
   * Feature/unfeature project
   * @param {string} id - Project ID
   * @param {boolean} featured - Featured status
   * @returns {Promise<Object>}
   */
  async toggleFeatured(id, featured) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/projects/${id}/feature`, { featured });
      
      console.warn('Projects.toggleFeatured: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { id, featured };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update featured status', 500);
    }
  }

  /**
   * Get current user's projects
   * @param {Object} params - Optional filters
   * @returns {Promise<Object>}
   */
  async getMyProjects(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/projects/my', { params });
      
      console.warn('Projects.getMyProjects: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        projects: demoProjects.slice(0, 3),
        total: 3,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch your projects', 500);
    }
  }

  /**
   * Fetch GitHub repositories
   * @returns {Promise<Object>}
   */
  async fetchGitHubRepos() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/projects/github');
      
      console.warn('Projects.fetchGitHubRepos: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        repositories: [],
        total: 0,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch GitHub repositories', 500);
    }
  }
}

export const projectsService = new ProjectsService();
