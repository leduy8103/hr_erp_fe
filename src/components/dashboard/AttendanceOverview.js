import React, { useState } from 'react';

const AttendanceOverview = () => {
  const [filter, setFilter] = useState('all');
  
  const attendanceData = [
    { name: 'Loasie Watson', designation: 'Team Lead - Design', type: 'Office', checkIn: '09:27 AM', status: 'Present' },
    { name: 'Darlene Robertson', designation: 'Web Designer', type: 'Office', checkIn: '10:15 AM', status: 'Present' },
    { name: 'Jacob Jones', designation: 'Medical Assistant', type: 'Remote', checkIn: '10:24 AM', status: 'Present' },
    { name: 'Kathryn Murphy', designation: 'Marketing Coordinator', type: 'Office', checkIn: '09:30 AM', status: 'Present' },
    { name: 'Leslie Alexander', designation: 'Data Analyst', type: 'Office', checkIn: '09:15 AM', status: 'Present' },
    { name: 'Ronald Richards', designation: 'Python Developer', type: 'Remote', checkIn: '09:29 AM', status: 'Present' },
    { name: 'Jenny Wilson', designation: 'React JS Developer', type: 'Remote', checkIn: '11:30 AM', status: 'Present' }
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeClass = (type) => {
    switch(type) {
      case 'Remote':
        return 'bg-blue-100 text-blue-800';
      case 'Office':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Attendance Overview</h2>
          <p className="text-sm text-gray-500">Daily employee attendance log</p>
        </div>
        <div className="mt-3 sm:mt-0 flex">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-md mr-2 ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('remote')}
            className={`px-3 py-1 text-xs rounded-md mr-2 ${filter === 'remote' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Remote
          </button>
          <button 
            onClick={() => setFilter('office')}
            className={`px-3 py-1 text-xs rounded-md ${filter === 'office' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Office
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData
              .filter(item => filter === 'all' || 
                       (filter === 'remote' && item.type === 'Remote') ||
                       (filter === 'office' && item.type === 'Office'))
              .map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                      {item.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{item.designation}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{item.checkIn}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceOverview;
