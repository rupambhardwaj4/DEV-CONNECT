import { ApiError } from './api';
import { demoDevelopers, demoProfile } from './demoData';

/**
 * Developers Service
 * 
 * Expected Backend Endpoints:
 * - GET /developers - List developers with filters and pagination
 * - GET /developers/:id - Get developer profile by ID
 * - GET /developers/me - Get current user's profile
 * - PUT /developers/me - Update current user's profile
 * - PATCH /developers/me - Partially update profile
 * - POST /developers/me/avatar - Upload profile avatar
 * - GET /developers/recommended - Get recommended developers
 * - GET /developers/search - Search developers
 */

class DevelopersService {
  /**
   * Get developers list with filters and pagination
   * @param {Object} params - { page, limit, skills, location, experience, sort }
   * @returns {Promise<Object>}
   */
  async getDevelopers(params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/developers', { params });
      
      console.warn('Developers.getDevelopers: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response
      return {
        developers: demoDevelopers,
        total: demoDevelopers.length,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 0,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch developers', 500);
    }
  }

  /**
   * Get developer profile by ID
   * @param {string} id - Developer ID
   * @returns {Promise<Object>}
   */
  async getDeveloperById(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get(`/developers/${id}`);
      
      console.warn('Developers.getDeveloperById: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        ...(demoDevelopers.find((developer) => developer.id === id) || demoProfile),
        id,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch developer profile', 500);
    }
  }

  /**
   * Get current user's profile
   * @returns {Promise<Object>}
   */
  async getCurrentProfile() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/developers/me');
      
      console.warn('Developers.getCurrentProfile: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        ...demoProfile,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch profile', 500);
    }
  }

  /**
   * Update current user's profile
   * @param {Object} data - Profile data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.put('/developers/me', data);
      
      console.warn('Developers.updateProfile: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { ...data, id: 'current-user-id' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update profile', 500);
    }
  }

  /**
   * Upload profile avatar
   * @param {FormData} formData - File with avatar image
   * @returns {Promise<Object>}
   */
  async uploadAvatar(_formData) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.upload('/developers/me/avatar', formData);
      
      console.warn('Developers.uploadAvatar: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { avatarUrl: '/placeholder-avatar.jpg' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to upload avatar', 500);
    }
  }

  /**
   * Get recommended developers
   * @param {Object} params - Optional filters
   * @returns {Promise<Object>}
   */
  async getRecommended(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/developers/recommended', { params });
      
      console.warn('Developers.getRecommended: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        developers: demoDevelopers.slice(0, 4).map((developer, index) => ({ ...developer, matchScore: 96 - index * 3 })),
        total: 4,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch recommendations', 500);
    }
  }

  /**
   * Search developers
   * @param {Object} params - { query, filters }
   * @returns {Promise<Object>}
   */
  async searchDevelopers(_params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/developers/search', { params });
      
      console.warn('Developers.searchDevelopers: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        developers: demoDevelopers,
        total: demoDevelopers.length,
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

export const developersService = new DevelopersService();
