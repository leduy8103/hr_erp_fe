import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaSearch, FaUser, FaTimes, FaCheck, FaCalendarAlt } from 'react-icons/fa';
import taskService from '../../services/taskService';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService';

const TaskList = ({ projectId, isManager, userId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [employeeNames, setEmployeeNames] = useState({});
  
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    project_id: projectId,
    user_id: '',
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  });
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempEditValue, setTempEditValue] = useState('');
  const [updatingTask, setUpdatingTask] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        let data;
        
        if (isManager) {
          data = await taskService.getTasksByProject(projectId, token);
        } else {
          data = await taskService.getTasksByProject(projectId, token);
        }
        
        setTasks(data);
        
        const namesMap = {};
        for (const task of data) {
          if (task.user_id && !namesMap[task.user_id]) {
            try {
              const name = await employeeService.getEmployeeNameById(task.user_id);
              namesMap[task.user_id] = name;
            } catch (err) {
              console.error(`Failed to fetch name for employee ${task.user_id}:`, err);
              namesMap[task.user_id] = 'Unknown';
            }
          }
        }
        setEmployeeNames(namesMap);
      } catch (err) {
        setError('Failed to load tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId, isManager, userId]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === '' || task.status === filterStatus;
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!isManager) {
      return matchesStatus && matchesSearch && 
        (task.user_id === userId || task.user_id === "" || task.user_id === null);
    }
    
    return matchesStatus && matchesSearch;
  });

  const canEditField = (task, field) => {
    if (isManager) return true;
    
    if (task.user_id === userId) {
      return field === 'status';
    }
    
    return false;
  };

  const handleDeleteTask = async (taskId) => {
    if (!isManager) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = authService.getToken();
        await taskService.deleteTask(taskId, token);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (err) {
        setError('Failed to delete task');
        console.error(err);
      }
    }
  };

  const fetchAvailableEmployees = async () => {
    if (!isManager) return;
    
    try {
      const token = authService.getToken();
      const employees = await employeeService.getEmployees(token);
      setAvailableEmployees(employees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleOpenAddTaskModal = () => {
    if (!isManager) return;
    
    setIsEditMode(false);
    setTaskToEdit(null);
    setNewTask({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      user_id: '',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
    });
    fetchAvailableEmployees();
    setShowAddTaskModal(true);
  };

  const handleOpenEditTaskModal = (task) => {
    if (!isManager) return;
    
    setIsEditMode(true);
    setTaskToEdit(task);
    
    const formattedDueDate = task.dueDate 
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : '';
    
    setNewTask({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'To Do',
      priority: task.priority || 'Medium',
      user_id: task.user_id || '',
      dueDate: formattedDueDate,
      project_id: projectId
    });
    
    fetchAvailableEmployees();
    setShowAddTaskModal(true);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    
    if (!isManager) return;
    
    if (!newTask.title) {
      alert('Please enter a task title');
      return;
    }
    
    try {
      setSubmitting(true);
      const token = authService.getToken();
      const taskData = {
        ...newTask,
        project_id: projectId,
        user_id: newTask.user_id || ""
      };
      
      let updatedTask;
      
      if (isEditMode && taskToEdit) {
        updatedTask = await taskService.updateTask(taskToEdit.id, taskData, token);
        
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskToEdit.id ? updatedTask : task
          )
        );
      } else {
        updatedTask = await taskService.createTask(taskData, token);
        
        setTasks(prevTasks => [...prevTasks, updatedTask]);
      }
      
      if (updatedTask.user_id && !employeeNames[updatedTask.user_id]) {
        try {
          const name = await employeeService.getEmployeeNameById(updatedTask.user_id);
          setEmployeeNames(prev => ({
            ...prev,
            [updatedTask.user_id]: name
          }));
        } catch (err) {
          console.error(`Failed to fetch name for employee ${updatedTask.user_id}:`, err);
        }
      }
      
      setShowAddTaskModal(false);
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} task:`, err);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (taskId, field, value) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!canEditField(task, field)) return;
    
    setEditingId(taskId);
    setEditingField(field);
    setTempEditValue(value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingField(null);
    setTempEditValue('');
  };

  const handleFieldChange = (e) => {
    setTempEditValue(e.target.value);
  };

  const saveField = async (taskId) => {
    if (updatingTask) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!canEditField(task, editingField)) return;
    
    try {
      setUpdatingTask(true);
      const token = authService.getToken();
      
      let updatedTask;
      
      if (editingField === 'status') {
        updatedTask = await taskService.updateTaskStatus(taskId, { status: tempEditValue }, token);
      } else if (editingField === 'priority' && isManager) {
        updatedTask = await taskService.updateTaskPriority(taskId, { priority: tempEditValue }, token);
      } else if (isManager) {
        const updateData = {
          ...task,
          [editingField]: tempEditValue
        };
        
        if (editingField === 'user_id') {
          updateData.user_id = tempEditValue || "";
          
          if (tempEditValue && !employeeNames[tempEditValue]) {
            try {
              const name = await employeeService.getEmployeeNameById(tempEditValue);
              setEmployeeNames(prev => ({
                ...prev,
                [tempEditValue]: name
              }));
            } catch (err) {
              console.error(`Failed to fetch name for employee ${tempEditValue}:`, err);
            }
          }
        }
        
        updatedTask = await taskService.updateTask(taskId, updateData, token);
      }
      
      if (updatedTask) {
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
      }
      
      setEditingId(null);
      setEditingField(null);
      setTempEditValue('');
    } catch (err) {
      console.error('Failed to update task field:', err);
      alert('Failed to update task. Please try again.');
    } finally {
      setUpdatingTask(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <Spinner animation="border" variant="primary" />
      <p className="ml-3 mt-2">Loading tasks...</p>
    </div>
  );
  
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Project Tasks</h2>
        {isManager && (
          <button 
            onClick={handleOpenAddTaskModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add New Task
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                {isManager && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/tasks/${task.id}`} className="text-gray-900 font-medium hover:text-blue-600">
                      {task.title}
                    </Link>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === task.id && editingField === 'user_id' ? (
                      <div className="flex items-center">
                        <select
                          value={tempEditValue}
                          onChange={handleFieldChange}
                          className="w-full py-1 pl-2 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Unassigned</option>
                          {availableEmployees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.full_name || employee.email || `Employee ${employee.id}`}
                            </option>
                          ))}
                        </select>
                        <div className="flex ml-2">
                          <button 
                            className="p-1 text-green-600 hover:text-green-800"
                            onClick={() => saveField(task.id)}
                            disabled={updatingTask}
                          >
                            <FaCheck size={16} />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={cancelEditing}
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`flex items-center ${isManager ? "cursor-pointer hover:bg-gray-100" : ""} p-1 rounded`}
                        onClick={() => {
                          if (isManager) {
                            fetchAvailableEmployees();
                            startEditing(task.id, 'user_id', task.user_id || '');
                          }
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                          {(task.user_id && employeeNames[task.user_id]?.charAt(0)) || <FaUser className="text-gray-400" />}
                        </div>
                        <span className="text-sm text-gray-700">
                          {task.user_id ? employeeNames[task.user_id] || 'Loading...' : 'Unassigned'}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === task.id && editingField === 'status' ? (
                      <div className="flex items-center">
                        <select
                          value={tempEditValue}
                          onChange={handleFieldChange}
                          className="w-full py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <div className="flex ml-2">
                          <button 
                            className="p-1 text-green-600 hover:text-green-800"
                            onClick={() => saveField(task.id)}
                            disabled={updatingTask}
                          >
                            <FaCheck size={16} />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={cancelEditing}
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`text-sm text-gray-700 ${canEditField(task, 'status') ? "cursor-pointer hover:bg-gray-100" : ""} p-1 rounded`}
                        onClick={() => canEditField(task, 'status') && startEditing(task.id, 'status', task.status)}
                      >
                        {task.status.replace('_', ' ')}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === task.id && editingField === 'priority' ? (
                      <div className="flex items-center">
                        <select
                          value={tempEditValue}
                          onChange={handleFieldChange}
                          className="w-full py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                        <div className="flex ml-2">
                          <button 
                            className="p-1 text-green-600 hover:text-green-800"
                            onClick={() => saveField(task.id)}
                            disabled={updatingTask}
                          >
                            <FaCheck size={16} />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={cancelEditing}
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`text-sm text-gray-700 ${isManager ? "cursor-pointer hover:bg-gray-100" : ""} p-1 rounded`}
                        onClick={() => isManager && startEditing(task.id, 'priority', task.priority)}
                      >
                        {task.priority}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === task.id && editingField === 'dueDate' ? (
                      <div className="flex items-center">
                        <input
                          type="date"
                          value={tempEditValue}
                          onChange={handleFieldChange}
                          className="w-full py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex ml-2">
                          <button 
                            className="p-1 text-green-600 hover:text-green-800"
                            onClick={() => saveField(task.id)}
                            disabled={updatingTask}
                          >
                            <FaCheck size={16} />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={cancelEditing}
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`text-sm text-gray-700 ${isManager ? "cursor-pointer hover:bg-gray-100" : ""} p-1 rounded flex items-center`}
                        onClick={() => {
                          if (isManager) {
                            const formattedDate = task.dueDate 
                              ? new Date(task.dueDate).toISOString().split('T')[0]
                              : '';
                            startEditing(task.id, 'dueDate', formattedDate);
                          }
                        }}
                      >
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Set due date'}
                      </div>
                    )}
                  </td>
                  
                  {isManager && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          title="Edit Task"
                          onClick={() => handleOpenEditTaskModal(task)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddTaskModal && isManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddTaskModal(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full relative z-10" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEditMode ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  <button 
                    onClick={() => setShowAddTaskModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitTask}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newTask.title}
                        onChange={handleTaskInputChange}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newTask.description}
                        onChange={handleTaskInputChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={newTask.status}
                          onChange={handleTaskInputChange}
                          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={newTask.priority}
                          onChange={handleTaskInputChange}
                          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={newTask.dueDate}
                        onChange={handleTaskInputChange}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignee
                      </label>
                      <select
                        name="user_id"
                        value={newTask.user_id}
                        onChange={handleTaskInputChange}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {availableEmployees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name || employee.email || `Employee ${employee.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowAddTaskModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                      disabled={submitting || !newTask.title}
                    >
                      {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Task' : 'Create Task')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;