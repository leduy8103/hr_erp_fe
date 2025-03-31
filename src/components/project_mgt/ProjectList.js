import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService'; // Import employeeService
import CreateProjectModal from './CreateProjectModal';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managerNames, setManagerNames] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const token = authService.getToken();

  // Set current user once
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          // Get user ID from the token
          const userId = authService.getUserIdFromToken();
          if (userId) {
            // Fetch complete user data from the API
            const userData = await employeeService.getEmployeeById(userId);
            // Add token to the user data object
            const user = { ...userData, token };
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          // Fallback to stored user if API call fails
          setCurrentUser(authService.getCurrentUser());
        }
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let data;
        
        // Fetch projects based on user role
        if (currentUser?.role === 'Admin') {
          // Admin sees all projects
          data = await projectService.getProjects(token);
        } else if (currentUser?.role === 'Manager') {
          // Manager sees projects they manage
          data = await projectService.getProjectByManager(currentUser.id, token);
        } else if (currentUser?.id) {
          // Employee sees projects they are members of
          data = await projectService.getProjectsByMember(currentUser.id, token);
        } else {
          // Default to all projects if role not determined yet
          data = await projectService.getProjects(token);
        }
        
        setProjects(data);
        setFilteredProjects(data);

        // Fetch manager names
        const managerIds = data.map(project => project.manager_id).filter(id => id);
        const managerNames = await Promise.all(managerIds.map(id => employeeService.getEmployeeNameById(id)));
        const managerNamesMap = managerIds.reduce((acc, id, index) => {
          acc[id] = managerNames[index];
          return acc;
        }, {});
        setManagerNames(managerNamesMap);

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    if (token && currentUser) {
      fetchProjects();
    } else if (token && !currentUser) {
      // Do nothing, wait for currentUser to be set
    } else {
      navigate('/login', { state: { from: '/projects' } });
    }
  }, [token, navigate, currentUser]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(term.toLowerCase()) ||
      project.description?.toLowerCase().includes(term.toLowerCase()) ||
      project.manager?.name?.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredProjects(filtered);
  }, [projects]);

  // Navigate to project details
  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Create new project
  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  // Handle project created - update to handle manager names properly
  const handleProjectCreated = (newProject) => {
    // If the new project already has a managerName property from CreateProjectModal
    if (newProject.managerName) {
      // Update the managerNames state with the new manager name
      setManagerNames(prev => ({
        ...prev,
        [newProject.manager_id]: newProject.managerName
      }));
      
      // Remove the temporary managerName property before adding to projects list
      const { managerName, ...projectWithoutManagerName } = newProject;
      setProjects(prev => [projectWithoutManagerName, ...prev]);
      setFilteredProjects(prev => [projectWithoutManagerName, ...prev]);
    } else {
      // If no managerName is provided, fetch it
      const fetchManagerName = async () => {
        try {
          if (newProject.manager_id) {
            const managerName = await employeeService.getEmployeeNameById(newProject.manager_id);
            setManagerNames(prev => ({
              ...prev,
              [newProject.manager_id]: managerName
            }));
          }
        } catch (error) {
          console.error("Error fetching manager name for new project:", error);
        }
      };
      
      fetchManagerName();
      
      // Add the new project to the lists
      setProjects(prev => [newProject, ...prev]);
      setFilteredProjects(prev => [newProject, ...prev]);
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in progress': return 'bg-blue-500 text-white';
      case 'on hold': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Render loading state
  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading projects...</div>;
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={handleCreateProject}
          >
            New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search projects by name, description, or manager..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Projects list */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm 
              ? `No projects found matching "${searchTerm}"`
              : currentUser?.role === 'Admin' 
                ? 'No projects available in the system'
                : currentUser?.role === 'Manager'
                  ? 'You are not managing any projects'
                  : 'You are not assigned to any projects'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:translate-y-[-4px] transition-transform"
              onClick={() => handleViewProject(project.id)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-800 truncate">{project.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}>
                    {project.status || 'Not Set'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Manager: {managerNames[project.manager_id] || 'Unassigned'}
                </p>
                
                <div className="border-t border-gray-200 my-3"></div>
                
                <p className="text-gray-700 line-clamp-2 mb-4 h-12">
                  {project.description || 'No description available'}
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">
                    {project.start_date && new Date(project.start_date).toLocaleDateString()} - 
                    {project.end_date && new Date(project.end_date).toLocaleDateString()}
                  </span>
                  <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectList;
