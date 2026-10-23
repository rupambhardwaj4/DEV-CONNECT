import { ApiError } from './api';
import { demoDevelopers, demoJobs, demoProjects } from './demoData';

/**
 * AI Recommendations Service
 * 
 * Expected Backend Endpoints:
 * - GET /recommendations/developers - Get AI-recommended developers
 * - GET /recommendations/jobs - Get AI-recommended jobs
 * - GET /recommendations/projects - Get AI-recommended projects
 * - GET /recommendations/:type/:id/insights - Get matching insights
 * 
 * Note: This service requires an AI/ML backend. If not available,
 * the frontend should show an honest "Service Unavailable" state.
 */

class RecommendationsService {
  /**
   * Check if AI recommendations service is available
   * @returns {Promise<Object>}
   */
  async checkAvailability() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/recommendations/health');
      
      console.warn('Recommendations.checkAvailability: Backend endpoint not yet implemented.');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        available: true,
        message: 'Demo recommendations are available',
      };
    } catch (_error) {
      return {
        available: false,
        message: 'AI recommendations service is not yet available',
      };
    }
  }

  /**
   * Get AI-recommended developers
   * @param {Object} params - { limit, skills, interests }
   * @returns {Promise<Object>}
   */
  async getRecommendedDevelopers(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/recommendations/developers', { params });
      
      console.warn('Recommendations.getRecommendedDevelopers: Backend endpoint not yet implemented.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        developers: demoDevelopers.slice(0, 3).map((developer, index) => ({ ...developer, matchScore: 95 - index * 3 })),
        total: 3,
        matchReasons: ['Shared React and TypeScript expertise'],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch recommendations', 500);
    }
  }

  /**
   * Get AI-recommended jobs
   * @param {Object} params - { limit, skills, location, jobType }
   * @returns {Promise<Object>}
   */
  async getRecommendedJobs(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/recommendations/jobs', { params });
      
      console.warn('Recommendations.getRecommendedJobs: Backend endpoint not yet implemented.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        jobs: demoJobs.map((job) => ({ ...job })),
        total: demoJobs.length,
        matchReasons: ['Strong match for Sagar’s full-stack experience'],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch recommendations', 500);
    }
  }

  /**
   * Get AI-recommended projects
   * @param {Object} params - { limit, skills, interests }
   * @returns {Promise<Object>}
   */
  async getRecommendedProjects(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/recommendations/projects', { params });
      
      console.warn('Recommendations.getRecommendedProjects: Backend endpoint not yet implemented.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        projects: demoProjects.slice(0, 3),
        total: 3,
        matchReasons: ['Relevant to Sagar’s developer tools interests'],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch recommendations', 500);
    }
  }

  /**
   * Get matching insights for a specific recommendation
   * @param {string} type - 'developers' | 'jobs' | 'projects'
   * @param {string} id - Item ID
   * @returns {Promise<Object>}
   */
  async getMatchInsights(_type, _id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get(`/recommendations/${type}/${id}/insights`);
      
      console.warn('Recommendations.getMatchInsights: Backend endpoint not yet implemented.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        matchScore: 0,
        factors: [],
        explanation: '',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch match insights', 500);
    }
  }
}

export const recommendationsService = new RecommendationsService();
