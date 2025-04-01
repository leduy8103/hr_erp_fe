import React, { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import TabNavigation from "./TabNavigation";
import EmployeeInfoForm from "./EmployeeInfoForm";
import AccountInfoForm from "./AccountInfoForm";
import UploadFilesForm from "./UploadFilesForm";
import employeeService from "../../services/employeeService";

const tabs = [
  { id: "employee", label: "Employee Information" },
  { id: "account", label: "Account Access" },
  { id: "upload", label: "Upload Files" },
];

const AddEmployeeModal = ({
  isOpen,
  onRequestClose,
  initialFormData,
  onSubmit,
  isEditMode = false,
}) => {
  const [activeTab, setActiveTab] = useState("employee");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    console.log("Modal props changed:", {
      isOpen,
      isEditMode,
      initialFormData,
    });
    // Reset form data when modal opens or initialFormData changes
    if (initialFormData) {
      console.log("Setting form data to:", initialFormData);
      setFormData({ ...initialFormData });
    } else if (isOpen && !initialFormData) {
      // Only reset form when opening for new employee
      console.log("Resetting form data (add mode)");
      setFormData({});
    }
  }, [initialFormData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleFileChange = (name, file) => {
    setFormData({
      ...formData,
      [name]: file,
    });
  };

  const handleMultipleFileChange = (name, files) => {
    setFormData({
      ...formData,
      [name]: [...(formData[name] || []), ...files],
    });
  };

  const handleRemoveFile = (name, fileIndex) => {
    if (Array.isArray(formData[name])) {
      const updatedFiles = [...formData[name]];
      updatedFiles.splice(fileIndex, 1);
      setFormData({
        ...formData,
        [name]: updatedFiles,
      });
    } else {
      setFormData({
        ...formData,
        [name]: null,
      });
    }
  };
  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeTab === "employee") {
      setActiveTab("account");
    } else if (activeTab === "account") {
      setActiveTab("upload");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // Update employee
        await onSubmit(formData);
      } else {
        // Add new employee
        const newEmployee = await employeeService.addEmployee(formData);

        // Upload files after adding the employee
        if (formData.profilePicture) {
          await employeeService.uploadFile(newEmployee.id, {
            profilePicture: formData.profilePicture,
          });
        }
        if (formData.resume) {
          await employeeService.uploadFile(newEmployee.id, {
            resume: formData.resume,
          });
        }
        if (formData.idProof) {
          await employeeService.uploadFile(newEmployee.id, {
            idProof: formData.idProof,
          });
        }
        if (formData.certificates && formData.certificates.length > 0) {
          await employeeService.uploadFile(newEmployee.id, {
            certificates: formData.certificates,
          });
        }

        await onSubmit(newEmployee);
      }

      // Reset form and close modal
      setFormData({});
      onRequestClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={isEditMode ? "Edit Employee Profile" : "Add New Employee"}>
      {console.log(
        "Rendering modal, isOpen:",
        isOpen,
        "isEditMode:",
        isEditMode
      )}
      <TabNavigation
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
      />

      <form className="pb-4" onSubmit={handleSubmit}>
        {activeTab === "employee" && (
          <EmployeeInfoForm formData={formData} onChange={handleInputChange} />
        )}

        {activeTab === "account" && (
          <AccountInfoForm
            formData={formData}
            onChange={handleInputChange}
            isEditMode={isEditMode}
          />
        )}

        {activeTab === "upload" && (
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
            onClick={onRequestClose}>
            Cancel
          </button>
          {activeTab !== "upload" ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isEditMode ? "Update" : "Submit"}
            </button>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default AddEmployeeModal;
