import React from 'react';

const AccountInfoForm = ({ formData, onChange }) => {
  // Function to generate a random 8-character password
  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    // Update the password in the form data
    onChange({
      target: {
        name: 'password',
        value: password
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-md p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-800">Account Information</h3>
        <p className="text-xs text-blue-600 mt-1">
          These details will be used for system access and authentication
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
          <input 
            type="text" 
            name="id"
            value={formData.id}
            onChange={onChange}
            placeholder="Auto-generated" 
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Enter email address" 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            name="role"
            value={formData.role}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select role</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Account">Account</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              name="password"
              value={formData.password || ''}
              onChange={onChange}
              placeholder="Enter password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <button
              type="button"
              onClick={generateRandomPassword}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Generate Password
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Password will be generated with 8 random characters.</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Account Settings</h4>
        <div className="flex items-center">
          <input
            id="active-account"
            type="checkbox"
            name="isActive"
            checked={formData.isActive !== false}
            onChange={(e) => onChange({
              target: {
                name: 'isActive',
                value: e.target.checked
              }
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active-account" className="ml-2 block text-sm text-gray-700">
            Activate account immediately
          </label>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoForm;