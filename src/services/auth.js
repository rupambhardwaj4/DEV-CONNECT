import { ApiError } from './api';

/**
 * Authentication Service
 * 
 * NOTE: This service is designed to work with a backend API. The actual API contracts
 * (endpoints, request/response formats) should be documented here once the backend is available.
 * 
 * Expected Backend Endpoints:
 * - POST /auth/register - Register a new user
 * - POST /auth/login - Authenticate user
 * - POST /auth/logout - Logout user
 * - POST /auth/forgot-password - Request password reset
 * - POST /auth/reset-password - Reset password with token
 * - POST /auth/verify-email - Verify email with token
 * - POST /auth/resend-verification - Resend verification email
 * - GET /auth/me - Get current user info
 * - PUT /auth/profile - Update user profile
 * 
 * Expected Response Formats:
 * Login/Registration: { user: {...}, token: string }
 * Error: { message: string, errors?: {...} }
 */

class AuthService {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password, confirmPassword }
   * @returns {Promise<Object>} - { user, token }
   */
  async register(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/auth/register', data);
      
      // TEMPORARY: Simulate API call for development
      // This will be replaced with actual API call once backend is available
      console.warn('Auth.register: Backend endpoint not yet implemented. Using mock response.');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - DO NOT use in production
      if (data.email === 'existing@example.com') {
        throw new ApiError('Email already registered', 409, { field: 'email' });
      }
      
      if (data.password.length < 8) {
        throw new ApiError('Password must be at least 8 characters', 400, { field: 'password' });
      }
      
      return {
        user: {
          id: 'temp-id',
          name: data.name,
          email: data.email,
          isVerified: false,
        },
        token: 'temp-token',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Registration failed. Please try again.', 500);
    }
  }

  /**
   * Login user
   * @param {Object} data - { email, password }
   * @returns {Promise<Object>} - { user, token }
   */
  async login(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/auth/login', data);
      
      // TEMPORARY: Simulate API call for development
      console.warn('Auth.login: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - DO NOT use in production
      if (data.email === 'wrong@example.com') {
        throw new ApiError('Invalid email or password', 401);
      }
      
      return {
        user: {
          id: 'temp-id',
          name: 'Sagar Kumar',
          email: data.email,
          isVerified: true,
        },
        token: 'temp-token',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Login failed. Please try again.', 500);
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // await api.post('/auth/logout');
      
      console.warn('Auth.logout: Backend endpoint not yet implemented.');
      
      // Clear local storage
      localStorage.removeItem('devconnect-token');
      localStorage.removeItem('devconnect-user');
    } catch {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('devconnect-token');
      localStorage.removeItem('devconnect-user');
      throw new ApiError('Logout failed', 500);
    }
  }

  /**
   * Request password reset
   * @param {Object} data - { email }
   * @returns {Promise<Object>}
   */
  async forgotPassword(_data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/auth/forgot-password', data);
      
      console.warn('Auth.forgotPassword: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { message: 'Password reset email sent' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to send reset email', 500);
    }
  }

  /**
   * Reset password with token
   * @param {Object} data - { token, password, confirmPassword }
   * @returns {Promise<Object>}
   */
  async resetPassword(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/auth/reset-password', data);
      
      console.warn('Auth.resetPassword: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.token === 'expired') {
        throw new ApiError('Reset link has expired', 400);
      }
      
      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to reset password', 500);
    }
  }

  /**
   * Verify email with token
   * @param {Object} data - { token }
   * @returns {Promise<Object>}
   */
  async verifyEmail(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/auth/verify-email', data);
      
      console.warn('Auth.verifyEmail: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.token === 'expired') {
        throw new ApiError('Verification link has expired', 400);
      }
      
      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to verify email', 500);
    }
  }

  /**
   * Resend verification email
   * @returns {Promise<Object>}
   */
  async resendVerification() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.post('/auth/resend-verification');
      
      console.warn('Auth.resendVerification: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { message: 'Verification email sent' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to resend verification email', 500);
    }
  }

  /**
   * Get current user info
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.get('/auth/me');
      
      console.warn('Auth.getCurrentUser: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: 'temp-id',
        name: 'John Doe',
        email: 'john@example.com',
        isVerified: true,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch user data', 500);
    }
  }

  /**
   * Update user profile
   * @param {Object} data - Profile data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(data) {
    try {
      // TODO: Replace with actual endpoint when backend is available
      // const response = await api.put('/auth/profile', data);
      
      console.warn('Auth.updateProfile: Backend endpoint not yet implemented. Using mock response.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...data,
        id: 'temp-id',
        email: 'john@example.com',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update profile', 500);
    }
  }
}

export const authService = new AuthService();
