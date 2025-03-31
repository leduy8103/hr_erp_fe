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
      <div className="text-sm text-gray-500 mb-4">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate('/employees')}
        >
          All Employee
        </span>{' '}
        {'>'} {profile.firstName} {profile.lastName}
      </div>

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
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l9-6 9 6v12H3V8z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v3"
                ></path>
              </svg>
              {profile.email}
            </p>
          </div>
        </div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          onClick={handleEditProfile}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
            ></path>
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
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {activeTab === 'Personal Information' && (
        <div
          className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong className="text-gray-500">Full Name</strong>
              <p>{profile.full_name}</p>
            </div>
            <div>
              <strong className="text-gray-500">Mobile Number</strong>
              <p>{profile.mobile}</p>
            </div>
            <div>
              <strong className="text-gray-500">Email Address</strong>
              <p>{profile.email}</p>
            </div>
            <div>
              <strong className="text-gray-500">Address</strong>
              <p>{profile.address}</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Professional Information' && (
        <div
          className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <h3 className="text-lg font-medium mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong className="text-gray-500">Department</strong>
              <p>{profile.department}</p>
            </div>
            <div>
              <strong className="text-gray-500">Position</strong>
              <p>{profile.position}</p>
            </div>
            <div>
              <strong className="text-gray-500">Hire Date</strong>
              <p>{profile.hire_date}</p>
            </div>
            <div>
              <strong className="text-gray-500">Status</strong>
              <p>{profile.status}</p>
            </div>
            <div>
              <strong className="text-gray-500">Role</strong>
              <p>{profile.role}</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Documents' && (
        <div
          className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <h3 className="text-lg font-medium mb-4">Documents</h3>
          <p className="text-gray-500">Documents will be displayed here.</p>
        </div>
      )}
      {activeTab === 'Account Access' && (
        <div
          className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <h3 className="text-lg font-medium mb-4">Account Access</h3>
          <p className="text-gray-500">Account access details will be displayed here.</p>
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