
import axios from 'axios';

// Sửa lại baseURL phù hợp
// const API_URL = 'http://localhost:3000'; // Địa chỉ server của bạn
const API_URL = 'http://localhost:8080/php-backend';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;