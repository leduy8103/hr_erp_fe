import React, { useState, useEffect } from 'react';
import AddEmployeeModal from './AddEmployeeModal';
import AddPerformanceReviewModal from './AddPerformanceReviewModal';
import FilterModal from './FilterModal';
import employeeService from '../../services/employeeService';
import authService from "../../services/authService"; // Assuming this service exists

const EmployeeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddPerformanceReviewModalOpen, setIsAddPerformanceReviewModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get current user info
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      // Use getUserRole method to get the user role from the token
      const userRole = authService.getUserRole();
      setIsAdmin(userRole === "Admin");

      // Get all employees
      const response = await employeeService.getEmployees();

      // Filter out current user from the employees list
      const currentUserId = authService.getUserIdFromToken();
      const filteredEmployees = response.filter(
        (emp) => emp.id !== currentUserId
      );
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  const [selectedUserId, setSelectedUserId] = useState(null); // Thêm state để lưu user_id

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEvaluateClick = (userId) => {
    setSelectedUserId(userId); // Lưu user_id của user được chọn
    setIsAddPerformanceReviewModalOpen(true); // Mở modal
  };
  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filters.selectedDepartments ||
        filters.selectedDepartments.length === 0 ||
        filters.selectedDepartments.includes(employee.department)) &&
      (!filters.selectedType || filters.selectedType === employee.type)
  );

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-blue-100 text-blue-800";
      case "resigned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEditEmployee = (employee) => {
    console.log("Edit button clicked for employee:", employee);
    // Make a copy of the employee object to avoid reference issues
    setEditingEmployee({ ...employee });
    // Ensure we're setting the modal to open
    setTimeout(() => {
      setIsAddEmployeeModalOpen(true);
    }, 0);
  };

  const handleModalClose = () => {
    console.log("Closing modal, resetting editing employee");
    setIsAddEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  // Function to handle saving employee (add or update)
  const handleSaveEmployee = async (updatedEmployee) => {
    try {
      if (editingEmployee) {
        // Update existing employee using updateEmployeeProfile
        console.log("Updating employee with ID:", editingEmployee.id);
        await employeeService.updateEmployeeProfile(
          editingEmployee.id,
          updatedEmployee
        );
      } else {
        // Add new employee
        await employeeService.addEmployee(updatedEmployee);
      }

      // Refresh employee list
      await fetchData();
      setEditingEmployee(null);
      setIsAddEmployeeModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleBlockUser = async (employee) => {
    try {
      await employeeService.blockUser(employee.id);
      // Refresh the data to show the updated blocked status
      await fetchData();
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">All Employees</h1>
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <button
            className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 flex items-center justify-center"
            onClick={() => setIsAddEmployeeModalOpen(true)}>
            <svg
              className="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Employee
          </button>
          <button
            className="w-full md:w-auto px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-md transition duration-200 flex items-center justify-center"
            onClick={() => setIsFilterModalOpen(true)}>
            <svg
              className="h-5 w-5 mr-2 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blocked
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.avatarURL ? (
                          <img
                            src={employee.avatarURL}
                            alt={employee.full_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${employee.full_name}&background=random`;
                            }}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {employee.full_name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.department}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.position}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.type}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        employee.status
                      )}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.is_blocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                      {employee.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition duration-200"
                        onClick={() => handleEvaluateClick(employee.id)}>
                        Evaluate
                      </button>
                      {isAdmin && (
                        <button
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition duration-200"
                          onClick={() => handleEditEmployee(employee)}>
                          Edit
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          className={`px-3 py-1 ${
                            employee.is_blocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-orange-600 hover:bg-orange-700"
                          } text-white text-sm rounded-md transition duration-200`}
                          onClick={() => handleBlockUser(employee)}>
                          {employee.is_blocked ? "Unblock" : "Block"}
                        </button>
                      )}
                      {isAdmin && (
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition duration-200">
                          Remove
                        </button>
                      )}
                      {!isAdmin && (
                        <button className="px-3 py-1 bg-gray-200 text-gray-500 text-sm rounded-md cursor-not-allowed">
                          No Permission
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No employees found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-gray-700">
          <span>Showing </span>
          <select
            className="border rounded-md px-2 py-1 mx-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={recordsPerPage}
            onChange={(e) => setRecordsPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span>
            {" "}
            out of <strong>{filteredEmployees.length}</strong> records
          </span>
        </div>

        <div className="inline-flex rounded-md shadow">
          <button
            className="px-2 py-1 border border-gray-300 bg-white text-sm font-medium rounded-l-md text-gray-700 hover:bg-gray-50"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}>
            Previous
          </button>
          <button className="px-2 py-1 border-t border-b border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
            {currentPage}
          </button>
          <button
            className="px-2 py-1 border border-gray-300 bg-white text-sm font-medium rounded-r-md text-gray-700 hover:bg-gray-50"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * recordsPerPage >= filteredEmployees.length}>
            Next
          </button>
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onRequestClose={handleModalClose}
        initialFormData={editingEmployee}
        onSubmit={handleSaveEmployee}
        isEditMode={!!editingEmployee}
      />
      <AddPerformanceReviewModal
        isOpen={isAddPerformanceReviewModalOpen}
        onRequestClose={() => setIsAddPerformanceReviewModalOpen(false)}
        userId={selectedUserId}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default EmployeeTable;