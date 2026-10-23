import { ApiError } from './api';
import { demoJobs } from './demoData';

/**
 * Jobs Service
 * 
 * Expected Backend Endpoints:
 * - GET /jobs - List jobs with filters and pagination
 * - GET /jobs/:id - Get job by ID
 * - POST /jobs/:id/save - Save job
 * - DELETE /jobs/:id/save - Unsave job
 * - GET /jobs/saved - Get saved jobs
 * - GET /jobs/search - Search jobs
 */

class JobsService {
  /**
   * Get jobs list with filters and pagination
   * @param {Object} params - { page, limit, query, location, type, remote, experience, skills, sort }
   * @returns {Promise<Object>}
   */
  async getJobs(params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/jobs', { params });
      
      console.warn('Jobs.getJobs: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        jobs: demoJobs,
        total: demoJobs.length,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 0,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch jobs', 500);
    }
  }

  /**
   * Get job by ID
   * @param {string} id - Job ID
   * @returns {Promise<Object>}
   */
  async getJobById(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get(`/jobs/${id}`);
      
      console.warn('Jobs.getJobById: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return demoJobs.find((job) => job.id === id) || demoJobs[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch job', 500);
    }
  }

  /**
   * Save job
   * @param {string} id - Job ID
   * @returns {Promise<Object>}
   */
  async saveJob(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/jobs/${id}/save`);
      
      console.warn('Jobs.saveJob: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, saved: true, id };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to save job', 500);
    }
  }

  /**
   * Unsave job
   * @param {string} id - Job ID
   * @returns {Promise<Object>}
   */
  async unsaveJob(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // await api.delete(`/jobs/${id}/save`);
      
      console.warn('Jobs.unsaveJob: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, saved: false, id };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to unsave job', 500);
    }
  }

  /**
   * Get saved jobs
   * @param {Object} params - Optional filters
   * @returns {Promise<Object>}
   */
  async getSavedJobs(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/jobs/saved', { params });
      
      console.warn('Jobs.getSavedJobs: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        jobs: demoJobs.slice(0, 2),
        total: 2,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch saved jobs', 500);
    }
  }

  /**
   * Search jobs
   * @param {Object} params - { query, filters }
   * @returns {Promise<Object>}
   */
  async searchJobs(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/jobs/search', { params });
      
      console.warn('Jobs.searchJobs: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        jobs: demoJobs,
        total: demoJobs.length,
        page: 1,
        limit: 20,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Search failed', 500);
    }
  }
}

export const jobsService = new JobsService();
