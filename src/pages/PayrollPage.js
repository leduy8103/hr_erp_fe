// filepath: d:\React\hr-erp-frontend\src\pages\PayrollPage.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAllPayrolls, exportPayroll, createPayroll, deletePayroll } from '../services/payrollService';
import PayrollItem from '../components/payroll/PayrollItem';
import PayrollForm from '../components/payroll/PayrollForm';
import authService from '../services/authService';

const PayrollPage = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Kiểm tra nếu người dùng là admin hoặc kế toán
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userRole = userData.user?.role || userData.role;
            const userId = userData.user?.id || userData.id;

            setIsAdmin(userRole === 'Admin' || userRole === 'Accountant');
            setUserRole(userRole);
            setUserId(userId);
        } catch (error) {
            console.error("Lỗi khi kiểm tra vai trò:", error);
            setIsAdmin(false);
        }

        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
      try {
        setLoading(true);
        const response = await getAllPayrolls();

        console.log("Raw API Response:", response);

        if (response?.success && response?.data?.data) {
          // Get the correct data array from the nested structure
          const payrollData = response.data.data;

          console.log("Extracted payroll data:", payrollData);
          // Remove the .data property access here since the array is directly in payrollData
          console.log("Number of payroll records:", payrollData.length);

          setPayrolls(payrollData);
          setError("");
        } else {
          console.error("Invalid response structure:", response);
          setPayrolls([]);
          setError("Không thể tải dữ liệu bảng lương");
        }
      } catch (err) {
        console.error("Error fetching payrolls:", err);
        setPayrolls([]);
        setError("Không thể tải dữ liệu bảng lương. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
    };

    const handleDeletePayroll = async (payrollId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bảng lương này?')) return;
    
        try {
            const response = await deletePayroll(payrollId);
            if (response.success) {
                setPayrolls(prevPayrolls => prevPayrolls.filter(payroll => payroll.id !== payrollId));
                setSuccessMessage('Đã xóa bảng lương thành công');
    
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError(response.message || 'Không thể xóa bảng lương');
            }
        } catch (err) {
            console.error('Lỗi khi xóa bảng lương:', err);
            setError(err.message || 'Không thể xóa bảng lương');
        }
    };

    const handleExport = async (employeeId) => {
        try {
            const response = await exportPayroll(employeeId);
            if (response.success) {
                console.log('Xuất bảng lương thành công:', response.data);
                setSuccessMessage('Đã xuất dữ liệu bảng lương thành công');

                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError(response.message || 'Xuất bảng lương thất bại');
            }
        } catch (err) {
            console.error('Lỗi khi xuất bảng lương:', err);
            setError(err.response?.data?.message || 'Không thể xuất dữ liệu bảng lương');
        }
    };

    const openExportModal = (employee) => {
        setSelectedEmployee(employee);
        setShowExportModal(true);
    };

    const closeExportModal = () => {
        setShowExportModal(false);
        setSelectedEmployee(null);
    };

    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
    };

    const handlePayrollCreated = (newPayroll) => {
        // Check if payrolls is initialized as an array
        if (!Array.isArray(payrolls)) {
            setPayrolls([newPayroll]);
        } else {
            setPayrolls(prevPayrolls => [newPayroll, ...prevPayrolls]);
        }

        setShowCreateModal(false);
        setSuccessMessage('Đã tạo bảng lương thành công');

        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset về trang đầu
    };

    // Lọc danh sách lương theo từ khóa tìm kiếm
    const filteredPayrolls = Array.isArray(payrolls)
        ? payrolls.filter(payroll => {
            if (!payroll || !payroll.employee) return false;
            const employeeName = payroll.employee.full_name || `ID: ${payroll.employee_id}`;
            return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        })
        : [];

    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPayrolls.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };


    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="container mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Bảng Lương</h1>
                        <p className="text-gray-600 mt-1">Quản lý lương nhân viên</p>
                    </div>
                </div>

                {/* Search and Actions Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="flex space-x-3">
                            {isAdmin && (
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md mr-2"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tạo mới
                                </button>
                            )}
                            <button
                                onClick={() => handleExport('all')}
                                className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Xuất PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex">
                            <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-800">{successMessage}</span>
                        </div>
                    </div>
                )}

                {/* Payroll Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nhân viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng thu nhập</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lương tháng</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khấu trừ</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    {isAdmin && (
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-gray-500 text-lg">Không tìm thấy dữ liệu bảng lương</p>
                                                <p className="text-gray-400">Các bảng lương sẽ hiển thị ở đây</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((payroll) => {
                                        console.log("Rendering payroll item:", payroll); // Debug log
                                        return (
                                            <PayrollItem
                                            key={payroll.id}
                                            payroll={payroll}
                                            onViewDetails={openExportModal}
                                            onDelete={() => handleDeletePayroll(payroll.id)}
                                            isAdmin={isAdmin}
                                            />
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">Hiển thị</span>
                                    <select
                                        className="border-gray-300 rounded-md text-sm"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                    <span className="text-sm text-gray-700 ml-2">
                                        trong tổng số {filteredPayrolls.length} kết quả
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div className="flex space-x-1">
                                        {[...Array(totalPages).keys()].map(number => (
                                            <button
                                                key={number + 1}
                                                onClick={() => paginate(number + 1)}
                                                className={`px-3 py-1 rounded-md ${currentPage === number + 1
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {number + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-4">Chi tiết bảng lương</h3>

                        {selectedEmployee && (
                            <div className="mb-6">
                                <div className="flex justify-between mb-4 pb-4 border-b">
                                    <span className="text-gray-600">Nhân viên:</span>
                                    <span className="font-medium">{selectedEmployee.employee?.full_name || `ID: ${selectedEmployee.employee_id}`}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Lương cơ bản:</span>
                                    <span>{formatCurrency(selectedEmployee.base_salary)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Phụ cấp:</span>
                                    <span>{formatCurrency(selectedEmployee.allowances)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">BHXH:</span>
                                    <span>{formatCurrency(selectedEmployee.social_insurance)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">BHYT:</span>
                                    <span>{formatCurrency(selectedEmployee.health_insurance)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">BHTN:</span>
                                    <span>{formatCurrency(selectedEmployee.unemployment_insurance)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Thuế TNCN:</span>
                                    <span>{formatCurrency(selectedEmployee.personal_income_tax)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Khấu trừ khác:</span>
                                    <span>{formatCurrency(selectedEmployee.deductions)}</span>
                                </div>
                                <div className="flex justify-between mb-2 pt-2 border-t font-semibold">
                                    <span>Tổng khấu trừ:</span>
                                    <span>{formatCurrency(selectedEmployee.total_deductions || selectedEmployee.deductions)}</span>
                                </div>
                                <div className="flex justify-between mb-2 pt-2 border-t font-semibold">
                                    <span>Lương thực nhận:</span>
                                    <span>{formatCurrency(selectedEmployee.net_salary)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Kỳ lương:</span>
                                    <span>{
                                        selectedEmployee.pay_period === 'Monthly' ? 'Hàng tháng' :
                                            selectedEmployee.pay_period === 'Bi-Weekly' ? 'Hai tuần' :
                                                selectedEmployee.pay_period === 'Weekly' ? 'Hàng tuần' :
                                                    selectedEmployee.pay_period || 'Hàng tháng'
                                    }</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeExportModal}
                                className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    handleExport(selectedEmployee.id);
                                    closeExportModal();
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                            >
                                Xuất PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Payroll Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Tạo bảng lương mới</h3>
                                <button
                                    onClick={closeCreateModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <PayrollForm
                                onSuccess={handlePayrollCreated}
                                onCancel={closeCreateModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PayrollPage;