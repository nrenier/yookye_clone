const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
const getToken = () => localStorage.getItem('access_token');
const setToken = (token) => localStorage.setItem('access_token', token);
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setRefreshToken = (token) => localStorage.setItem('refresh_token', token);
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API call wrapper with automatic token handling
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 - try to refresh token
    if (response.status === 401 && token && !endpoint.includes('/auth/refresh')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        config.headers.Authorization = `Bearer ${getToken()}`;
        const retryResponse = await fetch(url, config);
        return handleResponse(retryResponse);
      } else {
        // Refresh failed, clear tokens
        clearTokens();
        throw new Error('Authentication required');
      }
    }

    return handleResponse(response);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
};

// Refresh access token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.access_token) {
      setToken(response.access_token);
      setRefreshToken(response.refresh_token);
    }

    return response;
  },

  login: async (credentials) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.access_token) {
      setToken(response.access_token);
      setRefreshToken(response.refresh_token);
    }

    return response;
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  },

  getProfile: () => apiCall('/auth/profile'),

  updateProfile: (userData) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Travel API
export const travelAPI = {
  submitForm: (formData) => apiCall('/travel/submit-form', {
    method: 'POST',
    body: JSON.stringify(formData),
  }),

  getUserTravels: () => apiCall('/travel/my-travels'),

  getTravelDetails: (travelId) => apiCall(`/travel/travel/${travelId}`),

  updateTravelStatus: (travelId, status) => apiCall(`/travel/travel/${travelId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  getStatistics: () => apiCall('/travel/statistics'),

  getDestinations: () => apiCall('/travel/destinations'),
};

// User API
export const userAPI = {
  getPreferences: () => apiCall('/user/preferences'),

  savePreferences: (preferences) => apiCall('/user/preferences', {
    method: 'POST',
    body: JSON.stringify(preferences),
  }),

  getDashboard: () => apiCall('/user/dashboard'),

  getActivity: () => apiCall('/user/activity'),

  deleteAccount: () => apiCall('/user/delete-account', {
    method: 'DELETE',
  }),

  exportData: () => apiCall('/user/export-data'),
};

// System API
export const systemAPI = {
  healthCheck: () => apiCall('/health'),
};

// Authentication helper functions
export const auth = {
  isAuthenticated: () => !!getToken(),
  getUser: () => {
    const token = getToken();
    if (!token) return null;

    try {
      // Parse JWT token to get user info (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },
  getProfile: authAPI.getProfile,
  logout: authAPI.logout,
};

export default {
  auth: authAPI,
  travel: travelAPI,
  user: userAPI,
  system: systemAPI,
};