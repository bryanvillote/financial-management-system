const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = async (userData) => {
  return fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Add other API calls as needed 