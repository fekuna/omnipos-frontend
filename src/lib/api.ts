import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      // console.log("API Request Interceptor - Token:", token ? "Found" : "Missing", config.url);
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("API Request - No token found in localStorage for", config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 (Unauthorized) and Unwrap Data
api.interceptors.response.use(
  (response) => {
    // Unwrap standard API envelope if present
    if (response.data && response.data.status && response.data.data) {
        response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        if (typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            // Call refresh token endpoint (using a new axios instance to avoid loops)
            const refreshResponse = await axios.post(
                (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081') + "/v1/auth/refresh", 
                { refresh_token: refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Handle unwrapped vs wrapped response (just in case)
            const data = refreshResponse.data.data || refreshResponse.data;
            const newAccessToken = data.access_token || data.accessToken;
            
            if (newAccessToken) {
                localStorage.setItem('access_token', newAccessToken);
                // Update header and retry original request
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
