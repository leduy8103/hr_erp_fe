import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeProfile = ({ isDarkMode }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Personal Information');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get the employee ID from the URL

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await employeeService.getCurrentUserProfile(id); // Pass the id parameter
        setProfile(data);
      } catch (error) {
        setError('Error fetching profile: ' + error.message);
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [id]);

  const tabs = [
    'Personal Information',
    'Professional Information',
    'Documents',
    'Account Access',
  ];

  if (!profile) {
    return <div>Loading...</div>;
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      await employeeService.updateEmployeeProfile(id, updatedProfile);
      setProfile(updatedProfile);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      {/* <div className="text-sm text-gray-500 mb-4">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/employees")}>
          All Employee
        </span>{" "}
        {">"} {profile.firstName} {profile.lastName}
      </div> */}

      {/* Profile Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={profile.avatarURL}
            alt="Profile"
            className="w-24 h-32 rounded-md object-cover" // Adjusted size to larger 3x4 ratio
          />
          <div>
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l9-6 9 6v12H3V8z"></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v3"></path>
              </svg>
              {profile.email}
            </p>
          </div>
        </div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          onClick={handleEditProfile}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path>
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 text-sm font-medium ${
              activeTab === tab
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-purple-600"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {activeTab === "Personal Information" && (
        <div
          className={`p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
          } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Full Name
              </strong>
              <p className="text-lg">{profile.full_name}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Mobile Number
              </strong>
              <p className="text-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                {profile.mobile}
              </p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Email Address
              </strong>
              <p className="text-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {profile.email}
              </p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Address
              </strong>
              <p className="text-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {profile.address}
              </p>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Professional Information" && (
        <div
          className={`p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
          } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Department
              </strong>
              <p className="text-lg">{profile.department}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Position
              </strong>
              <p className="text-lg">{profile.position}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Hire Date
              </strong>
              <p className="text-lg">{profile.hire_date}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Status
              </strong>
              <p className="text-lg">{profile.status}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Role
              </strong>
              <p className="text-lg">{profile.role}</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Documents" && (
        <div
          className={`p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
          } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Documents
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px] duration-300 dark:bg-gray-800/40 dark:border-gray-700 flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-3 bg-purple-50 rounded-full flex items-center justify-center dark:bg-purple-900/50">
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <strong className="text-center">Resume</strong>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                PDF Document
              </p>
              <button className="mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px] duration-300 dark:bg-gray-800/40 dark:border-gray-700 flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-3 bg-blue-50 rounded-full flex items-center justify-center dark:bg-blue-900/50">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                </svg>
              </div>
              <strong className="text-center">ID Card</strong>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                JPG Image
              </p>
              <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px] duration-300 dark:bg-gray-800/40 dark:border-gray-700 flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-3 bg-green-50 rounded-full flex items-center justify-center dark:bg-green-900/50">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <strong className="text-center">Contract</strong>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                PDF Document
              </p>
              <button className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </button>
            </div>

            <div className="col-span-1 md:col-span-3 mt-4">
              <button className="w-full py-3 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-medium transition-colors duration-300 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Account Access" && (
        <div
          className={`p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
          } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
            Account Access
          </h3>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/40 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center dark:bg-indigo-900/50">
                    <svg
                      className="w-5 h-5 text-indigo-600 dark:text-indigo-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Access Level</h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Current permissions and role
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-sm font-medium rounded-full dark:bg-indigo-900/40 dark:text-indigo-200">
                  {profile.role || "Employee"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>View Personal Data</span>
                </div>
                <div className="flex items-center p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Upload Documents</span>
                </div>
                <div className="flex items-center p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Edit Company Data</span>
                </div>
                <div className="flex items-center p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Admin Access</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/40 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center dark:bg-amber-900/50">
                    <svg
                      className="w-5 h-5 text-amber-600 dark:text-amber-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Login History</h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Recent account activity
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>Successful login</span>
                  </div>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                    Today, 9:41 AM
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>Successful login</span>
                  </div>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                    Yesterday, 5:23 PM
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors duration-300 dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:text-gray-200">
                View Full History
              </button>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors duration-300 flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
                Change Password
              </button>
              <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors duration-300 flex items-center justify-center dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:text-white">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Account Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={isEditModalOpen}
        onRequestClose={handleModalClose}
        initialFormData={profile}
        onSubmit={handleProfileUpdate}
      />
    </div>
  );
};

export default EmployeeProfile;