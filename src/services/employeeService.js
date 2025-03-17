import api from './api';
import authService from './authService';

const addEmployee = async (employeeData) => {
  try {
    const response = await api.post('/api/auth/register', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error adding employee:', error.response?.data || error.message);
    throw error;
  }
};

const getEmployees = async () => {
  try {
    const response = await api.get('/api/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error.response?.data || error.message);
    throw error;
  }
};

const getEmployeeById = async (id) => {
  try {
    const response = await api.get(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Get current user profile
const getCurrentUserProfile = async () => {
  try {
    const userId = authService.getUserIdFromToken();
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return await getEmployeeById(userId);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/api/user/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

const employeeService = {
  addEmployee,
  getEmployees,
  getEmployeeById,
  getCurrentUserProfile,
  updateEmployee,
  deleteEmployee
};

export default employeeService;
