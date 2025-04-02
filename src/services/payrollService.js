// filepath: d:\React\hr-erp-frontend\src\services\payrollService.js
import api from './api';
import authService from './authService';

// Lấy tất cả bảng lương (chỉ cho admin và kế toán)
export const getAllPayrolls = async () => {
    try {
        const response = await api.get('/api/payroll/all');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payroll data'
        };
    }
};

// Lấy bảng lương của nhân viên đang đăng nhập
export const getEmployeePayrolls = async () => {
    try {
        const userId = authService.getUserIdFromToken();
        if (!userId) {
            throw new Error('User ID not found');
        }
        const response = await api.get(`/api/payroll/employee/${userId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching employee payrolls:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch your payroll data'
        };
    }
};

// Lấy lịch sử bảng lương cho nhân viên cụ thể (có thể lọc theo tháng)
export const getPayrollHistory = async (employeeId, month = null) => {
    try {
        let url = `/api/payroll/history/${employeeId}`;
        if (month) {
            url += `/${month}`;
        }
        const response = await api.get(url);
        return {
            success: true,
            data: response.data.history
        };
    } catch (error) {
        console.error('Error fetching payroll history:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payroll history'
        };
    }
};

// Lấy lịch sử bảng lương của người dùng hiện tại
export const getCurrentUserPayrollHistory = async (month = null) => {
    try {
        const userId = authService.getUserIdFromToken();
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return await getPayrollHistory(userId, month);
    } catch (error) {
        console.error('Error fetching current user payroll history:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch your payroll history'
        };
    }
};

// Lấy thống kê bảng lương (cho admin và kế toán)
export const getPayrollStatistics = async () => {
    try {
        const response = await api.get('/api/payroll/statistics');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching payroll statistics:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payroll statistics'
        };
    }
};

// Xuất bảng lương với kiểm tra quyền
export const exportPayroll = async (employeeId) => {
    try {
        const userRole = authService.getUserRole();
        // Nếu là employee, chỉ cho phép xuất bảng lương của chính mình
        if (userRole === 'Employee') {
            const userId = authService.getUserIdFromToken();
            if (employeeId !== userId && employeeId !== 'all') {
                throw new Error('Unauthorized to export other employee payrolls');
            }
        }

        const response = await api.get(`/api/payroll/export/${employeeId}`);
        return {
            success: true,
            data: response.data.payroll
        };
    } catch (error) {
        console.error('Error exporting payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to export payroll data'
        };
    }
};

// Tạo bảng lương mới (kiểm tra quyền admin/kế toán)
export const createPayroll = async (payrollData) => {
    try {
        const userRole = authService.getUserRole();
        if (userRole !== 'Admin' && userRole !== 'Accountant') {
            throw new Error('Unauthorized to create payroll');
        }

        const response = await api.post('/api/payroll/create', payrollData);
        return {
            success: true,
            data: response.data.payroll || response.data
        };
    } catch (error) {
        console.error('Error creating payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create payroll'
        };
    }
};

export const deletePayroll = async (payrollId) => {
    try {
        const response = await api.delete(`/api/payroll/delete/${payrollId}`);
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        console.error('Error deleting payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete payroll'
        };
    }
};

