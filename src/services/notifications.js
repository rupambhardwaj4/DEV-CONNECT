import { ApiError } from './api';
import { demoNotifications } from './demoData';

/**
 * Notifications Service
 * 
 * Expected Backend Endpoints:
 * - GET /notifications - Get user notifications
 * - GET /notifications/unread - Get unread count
 * - POST /notifications/:id/read - Mark as read
 * - POST /notifications/read-all - Mark all as read
 * - DELETE /notifications/:id - Delete notification
 */

class NotificationsService {
  /**
   * Get user notifications
   * @param {Object} params - { page, limit, type }
   * @returns {Promise<Object>}
   */
  async getNotifications(params = {}) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/notifications', { params });
      
      console.warn('Notifications.getNotifications: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        notifications: demoNotifications,
        total: demoNotifications.length,
        unreadCount: demoNotifications.filter((notification) => !notification.read).length,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch notifications', 500);
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>}
   */
  async getUnreadCount() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/notifications/unread');
      
      console.warn('Notifications.getUnreadCount: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { count: demoNotifications.filter((notification) => !notification.read).length };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch unread count', 500);
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>}
   */
  async markAsRead(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post(`/notifications/${id}/read`);
      
      console.warn('Notifications.markAsRead: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, id };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to mark as read', 500);
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>}
   */
  async markAllAsRead() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/notifications/read-all');
      
      console.warn('Notifications.markAllAsRead: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to mark all as read', 500);
    }
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>}
   */
  async deleteNotification(id) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // await api.delete(`/notifications/${id}`);
      
      console.warn('Notifications.deleteNotification: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, id };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete notification', 500);
    }
  }
}

export const notificationsService = new NotificationsService();
