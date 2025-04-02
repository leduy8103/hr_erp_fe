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

  const tabs = ["Personal Information", "Professional Information"];

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
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
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Profile Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <img
            src={profile.avatarURL || "https://via.placeholder.com/128"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900"
          />
          <div>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              {profile.email}
            </p>
            <div className="mt-2 flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.status === "Active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>
        <button
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center shadow-sm"
          onClick={handleEditProfile}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
            />
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
            className={`pb-4 px-6 text-sm font-medium relative ${
              activeTab === tab
                ? "text-purple-600"
                : "text-gray-500 hover:text-purple-600"
            }`}>
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></span>
            )}
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