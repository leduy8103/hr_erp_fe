import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Lấy user role từ localStorage khi component được mount
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
  }, []);
  
  const isAdminOrManager = () => {
    return userRole === 'Admin' || userRole === 'Manager';
  };
  
  const menuItems = [
    { title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { title: 'All Employees', icon: 'people', path: '/employees' },
    { title: 'All Departments', icon: 'apartment', path: '/departments' },
    { title: 'Attendance', icon: 'schedule', path: '/attendance' },
    { title: 'Payroll', icon: 'payments', path: '/payroll' },
    { title: 'Jobs', icon: 'work', path: '/jobs' },
    { title: 'Candidates', icon: 'person_search', path: '/candidates' },
    // Các tùy chọn nghỉ phép mở rộng với submenu
    { 
      title: 'Leaves', 
      icon: 'event', 
      path: '/leaves',
      subItems: [
        { title: 'Leave Request', path: '/leave-request' },
        ...(isAdminOrManager() ? [{ title: 'Leave Approval', path: '/leave-approval' }] : []),
      ]
    },
    { title: 'Holidays', icon: 'beach_access', path: '/holidays' },
    { title: 'Settings', icon: 'settings', path: '/settings' },
  ];

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // You would implement actual theme switching logic here
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex-shrink-0 flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center justify-center">
          <span className="material-icons text-purple-500 text-3xl mr-2">people</span>
          <span className="text-xl font-bold tracking-wider">HR ERP</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
                            (item.subItems && item.subItems.some(subItem => location.pathname === subItem.path));
            return (
              <li key={index}>
                {/* Main menu item */}
                <div className={`px-5 py-3 ${isActive ? 'bg-purple-700' : 'hover:bg-gray-700'} transition-colors duration-200`}>
                  {item.subItems ? (
                    // Item with submenu
                    <div className="flex items-center cursor-pointer">
                      <span className={`material-icons mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                      <span className={`${isActive ? 'font-medium' : ''}`}>{item.title}</span>
                      {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>}
                    </div>
                  ) : (
                    // Regular item without submenu
                    <Link to={item.path} className="flex items-center">
                      <span className={`material-icons mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                      <span className={`${isActive ? 'font-medium' : ''}`}>{item.title}</span>
                      {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>}
                    </Link>
                  )}
                </div>
                
                {/* Submenu items if they exist */}
                {item.subItems && (
                  <ul className="pl-12 bg-gray-900">
                    {item.subItems.map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <li key={`${index}-${subIndex}`} className="py-2">
                          <Link 
                            to={subItem.path}
                            className={`text-sm ${isSubActive ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-5 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Theme</span>
          <button 
            onClick={toggleTheme} 
            className="relative inline-flex items-center h-6 rounded-full w-12 bg-gray-700"
          >
            <span className="sr-only">Toggle theme</span>
            <span className={`${darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}></span>
          </button>
        </div>
        <div className="text-xs text-gray-400 text-center">v1.0.0 | © 2023 HR ERP</div>
      </div>
    </div>
  );
};

export default Sidebar;
