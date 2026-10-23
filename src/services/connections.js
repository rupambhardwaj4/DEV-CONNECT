import { ApiError } from './api';
import { demoConnections, demoPendingRequests, demoSentRequests } from './demoData';

/**
 * Connections Service
 * 
 * Expected Backend Endpoints:
 * - GET /connections - Get user's connections
 * - GET /connections/pending - Get pending connection requests
 * - GET /connections/sent - Get sent connection requests
 * - POST /connections/:id/request - Send connection request
 * - POST /connections/:id/accept - Accept connection request
 * - POST /connections/:id/reject - Reject connection request
 * - POST /connections/:id/cancel - Cancel sent request
 * - DELETE /connections/:id - Remove connection
 * - GET /connections/:id/status - Get connection status with user
 */

class ConnectionsService {
  /**
   * Get user's connections
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>}
   */
  async getConnections(params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/connections', { params });
      
      console.warn('Connections.getConnections: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        connections: demoConnections,
        total: demoConnections.length,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch connections', 500);
    }
  }

  /**
   * Get pending connection requests
   * @returns {Promise<Object>}
   */
  async getPendingRequests() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/connections/pending');
      
      console.warn('Connections.getPendingRequests: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        requests: demoPendingRequests,
        total: demoPendingRequests.length,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch pending requests', 500);
    }
  }

  /**
   * Get sent connection requests
   * @returns {Promise<Object>}
   */
  async getSentRequests() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/connections/sent');
      
      console.warn('Connections.getSentRequests: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        requests: demoSentRequests,
        total: demoSentRequests.length,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch sent requests', 500);
    }
  }

  /**
   * Send connection request
   * @param {string} userId - Target user ID
   * @returns {Promise<Object>}
   */
  async sendRequest(userId) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/connections/${userId}/request`);
      
      console.warn('Connections.sendRequest: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { status: 'pending', userId };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to send connection request', 500);
    }
  }

  /**
   * Accept connection request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>}
   */
  async acceptRequest(requestId) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/connections/${requestId}/accept`);
      
      console.warn('Connections.acceptRequest: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { status: 'connected', requestId };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to accept request', 500);
    }
  }

  /**
   * Reject connection request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>}
   */
  async rejectRequest(requestId) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/connections/${requestId}/reject`);
      
      console.warn('Connections.rejectRequest: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { status: 'rejected', requestId };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to reject request', 500);
    }
  }

  /**
   * Cancel sent connection request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>}
   */
  async cancelRequest(requestId) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/connections/${requestId}/cancel`);
      
      console.warn('Connections.cancelRequest: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { status: 'cancelled', requestId };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to cancel request', 500);
    }
  }

  /**
   * Remove connection
   * @param {string} userId - User ID to disconnect from
   * @returns {Promise<Object>}
   */
  async removeConnection(userId) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // await api.delete(`/connections/${userId}`);
      
      console.warn('Connections.removeConnection: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, userId };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to remove connection', 500);
    }
  }

  /**
   * Get connection status with a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getConnectionStatus(_userId) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get(`/connections/${userId}/status`);
      
      console.warn('Connections.getConnectionStatus: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        status: 'none', // none, pending, connected, rejected
        canRequest: true,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch connection status', 500);
    }
  }
}

export const connectionsService = new ConnectionsService();
