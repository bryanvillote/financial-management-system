// Get the current environment
const isDevelopment = import.meta.env.DEV;

// Set the API URL based on environment
export const API_URL = isDevelopment 
  ? 'http://localhost:8000'  // Development
  : 'https://financial-management-system-backend.vercel.app'; // Production

// Debug log to check the API URL
console.log('Current API URL:', API_URL);
console.log('Is Development:', isDevelopment);

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}; 