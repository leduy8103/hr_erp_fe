import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  const getBgColor = () => {
    const colors = {
      'bg-blue-500': 'bg-blue-100',
      'bg-green-500': 'bg-green-100',
      'bg-yellow-500': 'bg-yellow-100',
      'bg-purple-500': 'bg-purple-100',
    };
    return colors[color] || 'bg-gray-100';
  };
  
  const getTextColor = () => {
    const colors = {
      'bg-blue-500': 'text-blue-800',
      'bg-green-500': 'text-green-800',
      'bg-yellow-500': 'text-yellow-800',
      'bg-purple-500': 'text-purple-800',
    };
    return colors[color] || 'text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transform transition-transform hover:scale-105 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-xs text-green-500 mt-2 flex items-center">
            <span className="material-icons text-sm mr-1">trending_up</span>
            <span>+3.5% from last week</span>
          </p>
        </div>
        <div className={`${getBgColor()} ${getTextColor()} p-4 rounded-full`}>
          <span className="material-icons text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
