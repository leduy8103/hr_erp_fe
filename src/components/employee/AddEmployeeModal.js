import React, { useState } from 'react';
import BaseModal from './BaseModal';
import TabNavigation from './TabNavigation';
import EmployeeInfoForm from './EmployeeInfoForm';
import AccountInfoForm from './AccountInfoForm';
import UploadFilesForm from './UploadFilesForm';
import employeeService from '../../services/employeeService';

// Update the initialFormState to include all user attributes
const initialFormState = {
  // Employee Info (combined personal & professional)
  full_name: '',
  mobile: '',
  address: '',
  department: '',
  position: '',
  hire_date: '',
  status: 'Active',

};

const tabs = [
  { id: 'employee', label: 'Employee Information' },
  { id: 'account', label: 'Account Access' },
  { id: 'upload', label: 'Upload Files' }
];

const AddEmployeeModal = ({ isOpen, onRequestClose }) => {
  const [activeTab, setActiveTab] = useState('employee');
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleFileChange = (name, file) => {
    setFormData({
      ...formData,
      [name]: file
    });
  };

  const handleMultipleFileChange = (name, files) => {
    setFormData({
      ...formData,
      [name]: [...(formData[name] || []), ...files]
    });
  };

  const handleRemoveFile = (name, fileIndex) => {
    if (Array.isArray(formData[name])) {
      const updatedFiles = [...formData[name]];
      updatedFiles.splice(fileIndex, 1);
      setFormData({
        ...formData,
        [name]: updatedFiles
      });
    } else {
      setFormData({
        ...formData,
        [name]: null
      });
    }
  };
  // Inside your component
  const handleNext = (e) => {
    // Add this to prevent any default behavior or propagation
    e.preventDefault();
    e.stopPropagation();
    
    if (activeTab === 'employee') {
      setActiveTab('account');
    } else if (activeTab === 'account') {
      setActiveTab('upload');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await employeeService.addEmployee(formData);
      console.log('Employee added:', response);
      // Here you would typically handle the response, e.g., show a success message
      setFormData(initialFormState); // Reset form
      onRequestClose(); // Close modal after submission
    } catch (error) {
      console.error('Error adding employee:', error);
      // Here you would typically handle the error, e.g., show an error message
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title="Add New Employee"
    >
      <TabNavigation 
        activeTab={activeTab} 
        tabs={tabs} 
        onTabChange={setActiveTab} 
      />

      <form className="pb-4" onSubmit={handleSubmit}>
        {activeTab === 'employee' && (
          <EmployeeInfoForm 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}
        
        {activeTab === 'account' && (
          <AccountInfoForm 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}
        
        {activeTab === 'upload' && (
          <UploadFilesForm 
            formData={formData}
            onFileChange={handleFileChange}
            onMultipleFileChange={handleMultipleFileChange}
            onRemoveFile={handleRemoveFile}
          />
        )}
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
            onClick={onRequestClose}
          >
            Cancel
          </button>
          {activeTab !== 'upload' ? (
            <button 
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default AddEmployeeModal;