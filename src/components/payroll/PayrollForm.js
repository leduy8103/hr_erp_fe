// filepath: d:\React\hr-erp-frontend\src\components\payroll\PayrollForm.js
import React, { useState, useEffect } from 'react';
import employeeService from '../../services/employeeService';
import { createPayroll } from '../../services/payrollService';

// Tỷ lệ thuế và bảo hiểm theo quy định Việt Nam
const PERSONAL_INCOME_TAX_RATE = 0.1; // 10% thuế TNCN tạm tính
const SOCIAL_INSURANCE_RATE = 0.08; // 8% BHXH
const HEALTH_INSURANCE_RATE = 0.015; // 1.5% BHYT
const UNEMPLOYMENT_INSURANCE_RATE = 0.01; // 1% BHTN
const DEFAULT_REGION = 'I'; // Vùng I mặc định (Hà Nội, HCM)

// Mức lương tối thiểu vùng (2023)
const REGIONAL_MIN_WAGE = {
    'I': 4680000, // Vùng I: Hà Nội, HCM
    'II': 4160000, // Vùng II
    'III': 3640000, // Vùng III
    'IV': 3250000  // Vùng IV
};

const PayrollForm = ({ onSuccess, onCancel }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        employee_id: '',
        base_salary: '',
        allowances: '0',
        additional_deductions: '0', // Đổi tên từ deductions thành additional_deductions
        pay_period: 'Monthly',
        region: DEFAULT_REGION
    });
    const [calculations, setCalculations] = useState({
        social_insurance: 0,
        health_insurance: 0,
        unemployment_insurance: 0,
        personal_income_tax: 0,
        total_deductions: 0,
        net_salary: 0
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        // Tính toán thuế, bảo hiểm, khấu trừ và lương thực nhận
        if (formData.base_salary) {
            const baseSalary = parseFloat(formData.base_salary) || 0;
            const allowances = parseFloat(formData.allowances) || 0;
            const additionalDeductions = parseFloat(formData.additional_deductions) || 0;

            // Phần lương đóng BHXH (tối đa 20 lần lương cơ sở)
            const maxSocialInsuranceSalary = 20 * REGIONAL_MIN_WAGE[formData.region];
            const socialInsuranceSalary = Math.min(baseSalary, maxSocialInsuranceSalary);

            // Tính các khoản bảo hiểm
            const socialInsurance = socialInsuranceSalary * SOCIAL_INSURANCE_RATE;
            const healthInsurance = socialInsuranceSalary * HEALTH_INSURANCE_RATE;
            const unemploymentInsurance = socialInsuranceSalary * UNEMPLOYMENT_INSURANCE_RATE;

            // Tổng bảo hiểm
            const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

            // Thu nhập chịu thuế = lương cơ bản + phụ cấp - bảo hiểm - giảm trừ gia cảnh
            // Giả định giảm trừ gia cảnh 11 triệu cho bản thân
            const personalReduction = 11000000;
            const taxableIncome = Math.max(0, baseSalary + allowances - totalInsurance - personalReduction);

            // Tạm tính thuế TNCN theo mức 10% 
            const personalIncomeTax = taxableIncome * PERSONAL_INCOME_TAX_RATE;

            // Tổng khấu trừ = bảo hiểm + thuế TNCN + khấu trừ khác
            const totalDeductions = totalInsurance + personalIncomeTax + additionalDeductions;

            // Lương thực nhận
            const netSalary = baseSalary + allowances - totalDeductions;

            setCalculations({
                social_insurance: socialInsurance,
                health_insurance: healthInsurance,
                unemployment_insurance: unemploymentInsurance,
                personal_income_tax: personalIncomeTax,
                total_deductions: totalDeductions,
                net_salary: netSalary
            });
        }
    }, [formData.base_salary, formData.allowances, formData.additional_deductions, formData.region]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getEmployees();
            if (response && Array.isArray(response)) {
                setEmployees(response);
            } else {
                console.error('Không lấy được danh sách nhân viên:', response);
                setError('Không thể tải danh sách nhân viên');
            }
            setLoading(false);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách nhân viên:', err);
            setError('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra form
        if (!formData.employee_id) {
            setError('Vui lòng chọn nhân viên');
            return;
        }

        if (!formData.base_salary || parseFloat(formData.base_salary) <= 0) {
            setError('Vui lòng nhập mức lương hợp lệ');
            return;
        }

        // Kiểm tra lương tối thiểu vùng
        if (parseFloat(formData.base_salary) < REGIONAL_MIN_WAGE[formData.region]) {
            setError(`Lương không được thấp hơn mức lương tối thiểu vùng (${formatCurrency(REGIONAL_MIN_WAGE[formData.region])})`);
            return;
        }

        try {
            setLoading(true);

            // Chuẩn bị dữ liệu
            const payrollData = {
                employee_id: formData.employee_id, // Đảm bảo trường này đúng với backend
                base_salary: parseFloat(formData.base_salary),
                allowances: parseFloat(formData.allowances) || 0,
                deductions: parseFloat(formData.additional_deductions) || 0,
                social_insurance: Math.round(calculations.social_insurance),
                health_insurance: Math.round(calculations.health_insurance),
                unemployment_insurance: Math.round(calculations.unemployment_insurance),
                personal_income_tax: Math.round(calculations.personal_income_tax),
                total_deductions: Math.round(calculations.total_deductions),
                net_salary: Math.round(calculations.net_salary),
                pay_period: formData.pay_period,
                region: formData.region,
                status: 'Pending' // Đặt trạng thái mặc định là Chờ xử lý
            };

            console.log('Sending payroll data:', payrollData);

            const response = await createPayroll(payrollData);

            // Make sure we're passing the correct data structure to onSuccess
            if (response && response.data) {
                onSuccess(response.data);
            } else if (response) {
                // If response exists but doesn't have a data property, assume the response itself is the data
                onSuccess(response);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Lỗi khi tạo bảng lương:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tạo bảng lương');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo Bảng Lương Mới</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                    <select
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                        required
                    >
                        <option value="">Chọn nhân viên</option>
                        {employees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                                {employee.full_name || `ID: ${employee.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vùng lương</label>
                    <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        <option value="I">Vùng I - Hà Nội, TP HCM (4.680.000đ)</option>
                        <option value="II">Vùng II (4.160.000đ)</option>
                        <option value="III">Vùng III (3.640.000đ)</option>
                        <option value="IV">Vùng IV (3.250.000đ)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="base_salary"
                            value={formData.base_salary}
                            onChange={handleChange}
                            className="w-full p-2 pl-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min={REGIONAL_MIN_WAGE[formData.region]}
                            step="100000"
                            disabled={loading}
                            required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">VND</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Tối thiểu: {formatCurrency(REGIONAL_MIN_WAGE[formData.region])}
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phụ cấp</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="allowances"
                            value={formData.allowances}
                            onChange={handleChange}
                            className="w-full p-2 pl-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min="0"
                            step="100000"
                            disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">VND</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khấu trừ khác</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="additional_deductions"
                            value={formData.additional_deductions}
                            onChange={handleChange}
                            className="w-full p-2 pl-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min="0"
                            step="100000"
                            disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">VND</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ lương</label>
                    <select
                        name="pay_period"
                        value={formData.pay_period}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        <option value="Monthly">Hàng tháng</option>
                        <option value="Bi-Weekly">Hai tuần</option>
                        <option value="Weekly">Hàng tuần</option>
                    </select>
                </div>

                {/* Bảng tính toán */}
                {formData.base_salary && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-2">Bảng tính lương</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600">BHXH ({SOCIAL_INSURANCE_RATE * 100}%):</div>
                            <div className="text-right">{formatCurrency(calculations.social_insurance)}</div>

                            <div className="text-gray-600">BHYT ({HEALTH_INSURANCE_RATE * 100}%):</div>
                            <div className="text-right">{formatCurrency(calculations.health_insurance)}</div>

                            <div className="text-gray-600">BHTN ({UNEMPLOYMENT_INSURANCE_RATE * 100}%):</div>
                            <div className="text-right">{formatCurrency(calculations.unemployment_insurance)}</div>

                            <div className="text-gray-600">Thuế TNCN (tạm tính):</div>
                            <div className="text-right">{formatCurrency(calculations.personal_income_tax)}</div>

                            <div className="text-gray-600">Khấu trừ khác:</div>
                            <div className="text-right">{formatCurrency(parseFloat(formData.additional_deductions || 0))}</div>

                            <div className="text-gray-600 font-medium">Tổng khấu trừ:</div>
                            <div className="text-right font-medium">{formatCurrency(calculations.total_deductions)}</div>

                            <div className="border-t border-gray-200 col-span-2 my-1"></div>

                            <div className="text-gray-800 font-medium">Lương thực nhận:</div>
                            <div className="text-right font-medium">{formatCurrency(calculations.net_salary)}</div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Đang tạo...' : 'Tạo bảng lương'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PayrollForm;