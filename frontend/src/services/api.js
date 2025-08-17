import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Content API calls
export const contentApi = {
  // Get featured content for hero section
  getFeaturedContent: async () => {
    try {
      const response = await apiClient.get('/content/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured content:', error);
      throw error;
    }
  },

  // Get trending content
  getTrendingContent: async () => {
    try {
      const response = await apiClient.get('/content/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw error;
    }
  },

  // Get popular content
  getPopularContent: async () => {
    try {
      const response = await apiClient.get('/content/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular content:', error);
      throw error;
    }
  },

  // Get content by genre
  getContentByGenre: async (genre) => {
    try {
      const response = await apiClient.get(`/content/genre/${genre}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${genre} content:`, error);
      throw error;
    }
  },

  // Search content
  searchContent: async (query) => {
    try {
      const response = await apiClient.get('/content/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  },

  // Get content details
  getContentDetails: async (contentId) => {
    try {
      const response = await apiClient.get(`/content/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching content details:', error);
      throw error;
    }
  },

  // Get all categories at once
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/content/categories/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw error;
    }
  }
};

// User API calls
export const userApi = {
  // Get all user profiles
  getUserProfiles: async () => {
    try {
      const response = await apiClient.get('/users/profiles');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      throw error;
    }
  },

  // Create new user profile
  createUserProfile: async (profileData) => {
    try {
      const response = await apiClient.post('/users/profiles', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Get user's my list
  getMyList: async (profileId) => {
    try {
      const response = await apiClient.get(`/users/${profileId}/my-list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my list:', error);
      throw error;
    }
  },

  // Add to my list
  addToMyList: async (profileId, contentData) => {
    try {
      const response = await apiClient.post(`/users/${profileId}/my-list`, contentData);
      return response.data;
    } catch (error) {
      console.error('Error adding to my list:', error);
      throw error;
    }
  },

  // Remove from my list
  removeFromMyList: async (profileId, contentId) => {
    try {
      const response = await apiClient.delete(`/users/${profileId}/my-list/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from my list:', error);
      throw error;
    }
  },

  // Get continue watching
  getContinueWatching: async (profileId) => {
    try {
      const response = await apiClient.get(`/users/${profileId}/continue-watching`);
      return response.data;
    } catch (error) {
      console.error('Error fetching continue watching:', error);
      throw error;
    }
  },

  // Create viewing progress
  createViewingProgress: async (profileId, progressData) => {
    try {
      const response = await apiClient.post(`/users/${profileId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error creating viewing progress:', error);
      throw error;
    }
  },

  // Update viewing progress
  updateViewingProgress: async (profileId, contentId, progressData) => {
    try {
      const response = await apiClient.put(`/users/${profileId}/progress/${contentId}`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating viewing progress:', error);
      throw error;
    }
  }
};

// Health check
export const healthApi = {
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }
};

export default apiClient;