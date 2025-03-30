// filepath: d:\React\hr-erp-frontend\src\components\Layout.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Lấy dữ liệu người dùng từ localStorage và xử lý cấu trúc phù hợp
  let userInfo = {
    name: 'Guest User',
    role: 'Guest',
    avatar: null
  };

  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    // Cấu trúc có thể là { user: {...} } hoặc {...}
    if (userData.user) {
      userInfo = {
        name: userData.user.full_name || userData.user.name || 'User',
        role: userData.user.role || 'Guest',
        avatar: userData.user.avatar || null
      };
    } else {
      userInfo = {
        name: userData.full_name || userData.name || 'User',
        role: userData.role || 'Guest',
        avatar: userData.avatar || null
      };
    }
  } catch (error) {
    console.error('Error parsing user data in Layout:', error);
  }
  
  const isAdminOrManager = userInfo.role === 'Admin' || userInfo.role === 'Manager';
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-semibold">HR</span>
          </div>
          <div className="font-bold text-xl">HRMS</div>
        </div>
        
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/dashboard' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/employees"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/employees' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                All Employees
              </Link>
            </li>
            <li>
              <Link
                to="/departments"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/departments' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                All Departments
              </Link>
            </li>
            <li>
              <Link
                to="/attendance"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/attendance' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Attendance
              </Link>
            </li>
            <li>
              <Link
                to="/payroll"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/payroll' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Payroll
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/jobs' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/candidates"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/candidates' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Candidates
              </Link>
            </li>
            <li className="relative">
              <Link
                to="/leave-request"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/leave-request' || location.pathname === '/leave-approval' 
                  ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Leaves
                {location.pathname === '/leave-request' || location.pathname === '/leave-approval' ? (
                  <span className="absolute left-0 w-1 h-full bg-indigo-600"></span>
                ) : null}
              </Link>
              {location.pathname === '/leave-request' || location.pathname === '/leave-approval' ? (
                <ul className="ml-7 pl-4 border-l border-gray-200">
                  <li>
                    <Link
                      to="/leave-request"
                      className={`block py-2 text-sm ${
                        location.pathname === '/leave-request' ? 'text-indigo-600 font-medium' : 'text-gray-600'
                      }`}
                    >
                      Request
                    </Link>
                  </li>
                  {isAdminOrManager && (
                    <li>
                      <Link
                        to="/leave-approval"
                        className={`block py-2 text-sm ${
                          location.pathname === '/leave-approval' ? 'text-indigo-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        Approval
                      </Link>
                    </li>
                  )}
                </ul>
              ) : null}
            </li>
            <li>
              <Link
                to="/holidays"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/holidays' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
                Holidays
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === '/settings' ? 'text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 bg-white border-t">
          <div className="flex items-center">
            <button className="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 p-2 rounded w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Light
            </button>
            <button className="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 p-2 rounded w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              Dark
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="w-48 px-4 py-2 border rounded-md"
              />
              <button className="absolute right-3 top-2.5">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
            
            <button className="relative p-1">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src={userInfo.avatar || "https://via.placeholder.com/36"} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-800">{userInfo.name}</div>
                <div className="text-xs text-gray-500">{userInfo.role}</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;