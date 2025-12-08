import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Backend URL
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    if (response) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Only redirect if we are not already on the login page to avoid loops
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
             // Optional: Clear token
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             // Dispatch a custom event or let the store handle it, or simple redirect
             // window.location.href = '/login'; 
             // Better to let the store handle this or show a toast
             toast.error('Session expired. Please login again.');
        }
      } else {
        toast.error(response.data?.message || 'An error occurred');
      }
    } else {
      toast.error('Network Error');
    }
    return Promise.reject(error);
  }
);

export default api;
