// Get the current environment
const isDevelopment = import.meta.env.DEV;

// Always use the environment variable in production
const API_URL = import.meta.env.VITE_API_URL;

// Debug log to check the API URL
console.log('Current API URL:', API_URL);

export { API_URL };

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}; 