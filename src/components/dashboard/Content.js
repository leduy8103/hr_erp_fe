import React from 'react';
import StatCard from './StatCard';
import Schedule from './Schedule';

const Content = () => {
  const stats = [
    { title: 'Total Employees', value: '560', icon: 'people', color: 'bg-blue-500' },
    { title: 'Total Applicants', value: '1050', icon: 'person_add', color: 'bg-green-500' },
    { title: 'Today Attendance', value: '470', icon: 'event_available', color: 'bg-yellow-500' },
    { title: 'Total Projects', value: '250', icon: 'work', color: 'bg-purple-500' }
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        <div>
          <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm mr-2 hover:bg-gray-50">
            <span className="material-icons text-gray-500 text-sm align-middle mr-1">today</span>
            <span>July 2023</span>
          </button>
          <button className="bg-purple-600 text-white rounded-md px-4 py-2 text-sm hover:bg-purple-700">
            <span className="material-icons text-sm align-middle mr-1">add</span>
            <span>Create Report</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Schedule />
        </div>
      </div>
    </main>
  );
};

export default Content;
