import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import authService from "../../services/authService";

const Sidebar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState("employee"); // Default role

  useEffect(() => {
    // Get user role from token
    const token = authService.getToken();
    if (token) {
      const decodedToken = authService.decodeToken(token);
      if (decodedToken && decodedToken.role) {
        setUserRole(decodedToken.role.toLowerCase());
      }
    }
  }, []);

  const menuItems = [
    {
      title: "Dashboard",
      icon: "dashboard",
      path: "/dashboard",
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "All Employees",
      icon: "people",
      path: "/employees",
      roles: ["admin"],
    },
    {
      title: "My Tasks",
      icon: "task_alt",
      path: "/my-tasks",
      roles: ["employee", "manager"],
    },
    {
      title: "All Departments",
      icon: "apartment",
      path: "/departments",
      roles: ["admin", "manager"],
    },
    {
      title: "Attendance",
      icon: "schedule",
      path: "/attendance",
      roles: ["admin", "manager", "employee"],
    },
    { title: "Payroll", icon: "payments", path: "/payroll", roles: ["admin"] },
    {
      title: "Projects",
      icon: "work",
      path: "/projects",
      roles: ["admin", "manager"],
    },
    {
      title: "Candidates",
      icon: "person_search",
      path: "/candidates",
      roles: ["admin", "manager"],
    },
    {
      title: "Leaves",
      icon: "event",
      path: "/leaves",
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Holidays",
      icon: "beach_access",
      path: "/holidays",
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Settings",
      icon: "settings",
      path: "/settings",
      roles: ["admin"],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // You would implement actual theme switching logic here
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex-shrink-0 flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center justify-center">
          <span className="material-icons text-purple-500 text-3xl mr-2">
            people
          </span>
          <span className="text-xl font-bold tracking-wider">HR ERP</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {/* <div className="px-5 mb-4 text-sm">
          <span className="text-gray-400">Role:</span>
          <span className="ml-1 font-medium capitalize">{userRole}</span>
        </div> */}
        <ul>
          {filteredMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li
                key={index}
                className={`px-5 py-3 ${
                  isActive ? "bg-purple-700" : "hover:bg-gray-700"
                } transition-colors duration-200`}>
                <Link to={item.path} className="flex items-center">
                  <span
                    className={`material-icons mr-3 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}>
                    {item.icon}
                  </span>
                  <span className={`${isActive ? "font-medium" : ""}`}>
                    {item.title}
                  </span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>
                  )}
                </Link>
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
            className="relative inline-flex items-center h-6 rounded-full w-12 bg-gray-700">
            <span className="sr-only">Toggle theme</span>
            <span
              className={`${
                darkMode ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}></span>
          </button>
        </div>
        <div className="text-xs text-gray-400 text-center">
          v1.0.0 | © 2023 HR ERP
        </div>
      </div>
    </div>
  );
};

export default Sidebar;