// filepath: src/services/authService.js
import api from './api';

const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data && response.data.token) {
      // Store the entire response data including the token
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const getToken = () => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

const isAuthenticated = () => {
  return getToken() !== null;
};

// Function to decode JWT token
const decodeToken = (token) => {
  if (!token) return null;
  try {
    // JWT tokens are base64 encoded
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get the user ID from token
const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  const decodedToken = decodeToken(token);
  return decodedToken ? decodedToken.id || decodedToken.userId || decodedToken.sub : null;
};

const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  decodeToken,
  getUserIdFromToken
};

export default authService;