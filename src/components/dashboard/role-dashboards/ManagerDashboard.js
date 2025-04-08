import React, { useState, useEffect } from 'react';
import StatCard from '../StatCard';
import employeeService from '../../../services/employeeService';
import projectService from '../../../services/projectService';
import attendanceService from '../../../services/attendanceService';
import authService from '../../../services/authService';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = authService.getUserIdFromToken();
        const token = authService.getToken();

        const [employeesResponse, projectsResponse, attendanceResponse] = await Promise.all([
          employeeService.getEmployees(),
          projectService.getProjectsByMember(userId, token),
          attendanceService.getAllUsersAttendance()
        ]);

        const employees = Array.isArray(employeesResponse) ? employeesResponse : 
                         (employeesResponse?.data || []);
        const projects = Array.isArray(projectsResponse) ? projectsResponse : 
                        (projectsResponse?.data || []);
        const attendance = Array.isArray(attendanceResponse) ? attendanceResponse : 
                         (attendanceResponse?.data || []);

        setStats([
          { title: 'Team Members', value: employees.length.toString(), icon: 'groups', color: 'bg-blue-500' },
          { title: 'My Projects', value: projects.length.toString(), icon: 'work', color: 'bg-purple-500' },
          { title: 'Present Today', value: attendance.filter(a => a?.check_in_time && !a?.check_out_time).length.toString(), icon: 'check_circle', color: 'bg-green-500' }
        ]);

        // Get today's attendance records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRecords = attendance.filter(record => {
          const recordDate = new Date(record.check_in_time);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === today.getTime();
        });

        const attendancePromises = todayRecords
          .slice(0, 5)
          .map(async record => ({
            id: record.id,
            employee: await employeeService.getEmployeeNameById(record.id),
            time: attendanceService.formatTime(record.check_in_time),
            date: attendanceService.formatDate(record.check_in_time)
          }));

        const resolvedAttendance = await Promise.all(attendancePromises);
        setTeamAttendance(resolvedAttendance);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manager Dashboard</h2>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700">
            <span className="material-icons text-sm align-middle mr-1">add</span>
            <span>New Project</span>
          </button>
          <button className="bg-green-600 text-white rounded-md px-4 py-2 text-sm hover:bg-green-700">
            <span className="material-icons text-sm align-middle mr-1">assignment</span>
            <span>Assign Tasks</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Team Attendance Today</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamAttendance.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{activity.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{activity.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{activity.date}</td>
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

export default ManagerDashboard;
