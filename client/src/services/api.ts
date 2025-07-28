import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token for admin routes
api.interceptors.request.use(
  (config) => {
    // Add auth token for admin routes and protected routes (menu, orders, loyalty)
    const url = config.url || '';
    const isAdminRoute = url.includes('/admin') || 
                        url.includes('/menu') || 
                        url.includes('/orders') || 
                        url.includes('/loyalty');
    
    if (isAdminRoute) {
      const token = localStorage.getItem('token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Remove Authorization header for non-admin routes
      if (config.headers && 'Authorization' in config.headers) {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors for admin routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 for admin and protected routes, but NOT for login route
    const url = error.config?.url || '';
    const isAdminRoute = url.includes('/admin') || 
                        url.includes('/menu') || 
                        url.includes('/orders') || 
                        url.includes('/loyalty');
    const isLoginRoute = url.includes('/admin/login');
    
    // Only redirect on 401 for admin routes, but NOT for login route
    if (error.response?.status === 401 && isAdminRoute && !isLoginRoute) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export type { ApiResponse };
export default api;

// Category CRUD API
export const getCategories = () => api.get('/categories');
export const createCategory = (data: { name: string }) => api.post('/categories', data);
export const updateCategory = (id: string, data: { name: string }) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`); 