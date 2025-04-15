import api from './api';
import authService from './authService';

const notificationService = {
  getNotifications: async () => {
    const token = authService.getToken();
    const response = await api.get('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default notificationService;
