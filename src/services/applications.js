import { ApiError } from './api';
import { demoApplications } from './demoData';

/**
 * Applications Service
 * 
 * Expected Backend Endpoints:
 * - GET /applications - Get user's applications
 * - GET /applications/:id - Get application by ID
 * - POST /jobs/:id/apply - Submit job application
 * - POST /applications/:id/withdraw - Withdraw application
 * - GET /applications/status - Get application status options
 */

class ApplicationsService {
  /**
   * Get user's applications
   * @param {Object} params - { page, limit, status, jobId }
   * @returns {Promise<Object>}
   */
  async getApplications(params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/applications', { params });
      
      console.warn('Applications.getApplications: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        applications: demoApplications,
        total: demoApplications.length,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch applications', 500);
    }
  }

  /**
   * Get application by ID
   * @param {string} id - Application ID
   * @returns {Promise<Object>}
   */
  async getApplicationById(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get(`/applications/${id}`);
      
      console.warn('Applications.getApplicationById: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return demoApplications.find((application) => application.id === id) || demoApplications[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch application', 500);
    }
  }

  /**
   * Submit job application
   * @param {string} jobId - Job ID
   * @param {Object} data - { resume, coverLetter, answers }
   * @returns {Promise<Object>}
   */
  async submitApplication(jobId, _data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const formData = new FormData();
      // if (data.resume) formData.append('resume', data.resume);
      // if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
      // if (data.answers) formData.append('answers', JSON.stringify(data.answers));
      // const response = await api.post(`/jobs/${jobId}/apply`, formData);
      
      console.warn('Applications.submitApplication: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        applicationId: 'new-application-id',
        jobId,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to submit application', 500);
    }
  }

  /**
   * Withdraw application
   * @param {string} id - Application ID
   * @returns {Promise<Object>}
   */
  async withdrawApplication(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // await api.post(`/applications/${id}/withdraw`);
      
      console.warn('Applications.withdrawApplication: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, id, status: 'withdrawn' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to withdraw application', 500);
    }
  }

  /**
   * Get application status options
   * @returns {Promise<Object>}
   */
  async getStatusOptions() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/applications/status');
      
      console.warn('Applications.getStatusOptions: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        statuses: [
          { value: 'submitted', label: 'Submitted', description: 'Application submitted successfully' },
          { value: 'under_review', label: 'Under Review', description: 'Application is being reviewed' },
          { value: 'shortlisted', label: 'Shortlisted', description: 'You have been shortlisted' },
          { value: 'interview_scheduled', label: 'Interview Scheduled', description: 'Interview scheduled' },
          { value: 'rejected', label: 'Rejected', description: 'Application was not selected' },
          { value: 'withdrawn', label: 'Withdrawn', description: 'Application withdrawn by you' },
          { value: 'hired', label: 'Hired', description: 'You were hired for this position' },
        ],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch status options', 500);
    }
  }
}

export const applicationsService = new ApplicationsService();
