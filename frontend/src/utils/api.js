// Get the current environment
const isDevelopment = import.meta.env.DEV;

// Set the API URL based on environment
export const API_URL = isDevelopment 
  ? 'http://localhost:8000'  // Development
  : import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app'; // Production

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}; 