import React, { useState, useEffect } from 'react';
import StatCard from '../StatCard';
import attendanceService from '../../../services/attendanceService';
import { getUserLeaveRequests } from '../../../services/leaveService';

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attendanceResponse, leaveResponse] = await Promise.all([
          attendanceService.getCurrentUserAttendance(),
          getUserLeaveRequests()
        ]);

        const currentAttendance = Array.isArray(attendanceResponse) ? attendanceResponse[0] : 
                                (attendanceResponse?.data || {});

        setAttendance(currentAttendance);
        
        const leaves = Array.isArray(leaveResponse) ? leaveResponse : 
                      (leaveResponse?.data || []);

        setStats([
          { title: 'Today Status', value: currentAttendance?.status || 'Not Checked In', icon: 'event_available', color: 'bg-blue-500' },
          { title: 'Leave Requests', value: leaves.length.toString(), icon: 'calendar_today', color: 'bg-purple-500' },
          { title: 'Pending Leaves', value: leaves.filter(l => l.status === 'Pending').length.toString(), icon: 'pending_actions', color: 'bg-yellow-500' }
        ]);

        setLeaveHistory(
          leaves.slice(0, 5).map(leave => ({
            id: leave.id,
            type: leave.leave_type,
            from: new Date(leave.start_date).toLocaleDateString(),
            to: new Date(leave.end_date).toLocaleDateString(),
            status: leave.status
          }))
        );

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Dashboard</h2>
        <div className="space-x-2">
          {!attendance?.checkedIn && (
            <button 
              onClick={() => attendanceService.checkIn({})}
              className="bg-green-600 text-white rounded-md px-4 py-2 text-sm hover:bg-green-700"
            >
              <span className="material-icons text-sm align-middle mr-1">login</span>
              <span>Check In</span>
            </button>
          )}
          {attendance?.checkedIn && !attendance?.checkedOut && (
            <button 
              onClick={() => attendanceService.checkOut({})}
              className="bg-red-600 text-white rounded-md px-4 py-2 text-sm hover:bg-red-700"
            >
              <span className="material-icons text-sm align-middle mr-1">logout</span>
              <span>Check Out</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Leave History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveHistory.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.from}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.to}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
