const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API URL:', API_URL); // Debug log

const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log('Making request to:', `${API_URL}${endpoint}`); // Debug log
  console.log('Headers:', headers); // Debug log

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API Error Response:', error); // Debug log
      throw new Error(error.message || 'Something went wrong');
    }

    const data = await response.json();
    console.log('Response data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  console.log('Attempting login with:', credentials); // Debug log
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = async (userData) => {
  console.log('Attempting registration with:', userData); // Debug log
  return fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Add other API calls as needed 