import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService';
import AttendanceOverview from '../Attendancce/AttendanceOverview';

const AttendancePage = () => {
  const [userRole, setUserRole] = useState('');
  const [showOverview, setShowOverview] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [gpsData, setGpsData] = useState(null);
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [workingHours, setWorkingHours] = useState(0);
  const [workingMinutes, setWorkingMinutes] = useState(0);
  console.log(employeeService.getCurrentUserProfile());

  const formatTime = (isoTime) => {
    if (!isoTime) return '';
    const date = new Date(isoTime);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    if (typeof dateString === 'string' && 
        (dateString === 'No Previous Records' || 
         dateString.includes('Previous Record'))) {
      return dateString;
    }
    
    try {
      console.log('Date string to format:', dateString);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const inputDate = new Date(dateString);
      
      if (isNaN(inputDate.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      if (inputDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else {
        return inputDate.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };
  
  const getUserId = () => {
    return authService.getUserIdFromToken() || 1;
  };

  const getUserRoleFromToken = () => {
    try {
      const token = authService.getToken();
      if (!token) return '';
      
      const decoded = authService.decodeToken(token);
      console.log('Decoded token:', decoded);
      
      let role = '';
      if (decoded.role) {
        role = decoded.role;
      } else if (decoded.roles && Array.isArray(decoded.roles)) {
        role = decoded.roles[0];
      } else if (decoded.claims && decoded.claims.role) {
        role = decoded.claims.role;
      }
      
      const profile = employeeService.getCurrentUserProfile();
      if (profile && profile.role) {
        role = profile.role;
      }
      
      return role;
    } catch (error) {
      console.error('Error getting user role from token:', error);
      return '';
    }
  };

  const isAdminOrManager = () => {
    const role = userRole.toLowerCase();
    return role === 'admin' || role === 'manager';
  };

  const toggleView = () => {
    setShowOverview(!showOverview);
  };

  useEffect(() => {
    const role = getUserRoleFromToken();
    console.log('User role:', role);
    setUserRole(role);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      
      if (attendanceData && attendanceData.is_checked_in && !attendanceData.is_checked_out) {
        const checkInTime = new Date(attendanceData.attendance_data.check_in_time);
        const diffMs = now - checkInTime;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        setWorkingHours(diffHrs);
        setWorkingMinutes(diffMins);
      }
    };
    
    const clockInterval = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(clockInterval);
  }, [attendanceData]);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setGpsData({ latitude, longitude, accuracy });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError("Unable to retrieve your location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);
  
  const fetchAttendanceStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const currentResponse = await fetch(
        "http://localhost:3000/api/attendance/currentuser",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!currentResponse.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const currentResult = await currentResponse.json();
      console.log("Current attendance data:", currentResult);

      if (currentResult.data && currentResult.data.today_date) {
        setTodayDate(currentResult.data.today_date);
      }

      if (currentResult.data) {
        setAttendanceData(currentResult.data);
      }

      const historyResponse = await fetch(
        "http://localhost:3000/api/attendance/history",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!historyResponse.ok) {
        throw new Error("Failed to fetch attendance history");
      }

      const historyResult = await historyResponse.json();
      console.log("Attendance history:", historyResult);

      let processedHistory = [];

      if (currentResult.data && currentResult.data.is_checked_in) {
        const todayRecord = {
          day: currentResult.data.today_date,
          checkInTime: currentResult.data.attendance_data.check_in_time,
          checkOutTime: currentResult.data.is_checked_out
            ? currentResult.data.attendance_data.check_out_time
            : "Working...",
          status: currentResult.data.status,
        };

        processedHistory.push(todayRecord);
      }

      if (historyResult.data && Array.isArray(historyResult.data)) {
        const previousRecords = historyResult.data.map((record) => ({
          day: record.date || record.created_at,
          checkInTime: record.check_in_time,
          checkOutTime: record.check_out_time,
          status: record.status || "Completed",
        }));

        processedHistory = [...processedHistory, ...previousRecords];
      }

      if (processedHistory.length === 0) {
        processedHistory.push({
          day: "No Previous Records",
          checkInTime: "--:--",
          checkOutTime: "--:--",
          status: "N/A",
        });
      }

      setAttendanceHistory(processedHistory);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentAttendanceFromToday = () => {
    if (
      !attendanceData ||
      !attendanceData.attendance_data ||
      !attendanceData.attendance_data.check_in_time
    ) {
      return false;
    }

    const checkInDate = new Date(attendanceData.attendance_data.check_in_time)
      .toISOString()
      .split("T")[0];
    return checkInDate === todayDate;
  };

  const handleCheckIn = async () => {
    if (!gpsData) {
      setError(
        "GPS data is required for check-in. Please enable location services."
      );
      return;
    }

    try {
      setLoading(true);

      const statusResponse = await fetch(
        "http://localhost:3000/api/attendance/currentuser",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to verify current attendance status");
      }

      const statusData = await statusResponse.json();
      console.log("Current status data:", statusData);

      if (
        statusData.data &&
        statusData.data.is_checked_in &&
        !statusData.data.is_checked_out &&
        isCurrentAttendanceFromToday()
      ) {
        setError("You have already checked in today and haven't checked out.");
        setLoading(false);
        return;
      }

      const now = new Date();

      const checkInData = {
        userId: getUserId(),
        check_in_time: now.toISOString(),
        gps_location: gpsData,
      };

      console.log("Sending check-in data:", checkInData);

      const response = await fetch(
        "http://localhost:3000/api/attendance/check-in",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(checkInData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in");
      }

      console.log("Check-in successful");

      setWorkingHours(0);
      setWorkingMinutes(0);

      await fetchAttendanceStatus();
    } catch (err) {
      console.error("Check-in error:", err);
      setError(err.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!gpsData) {
      setError(
        "GPS data is required for check-out. Please enable location services."
      );
      return;
    }

    try {
      setLoading(true);

      const statusResponse = await fetch(
        "http://localhost:3000/api/attendance/currentuser",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to verify current attendance status");
      }

      const statusData = await statusResponse.json();

      if (!statusData.data || !statusData.data.is_checked_in) {
        setError("You must check in first");
        setLoading(false);
        return;
      }

      if (statusData.data.is_checked_out) {
        setError("You have already checked out today");
        setLoading(false);
        return;
      }

      const now = new Date();

      const checkOutData = {
        userId: getUserId(),
        check_out_time: now.toISOString(),
        gps_location: gpsData,
      };

      console.log("Sending check-out data:", checkOutData);

      const response = await fetch(
        "http://localhost:3000/api/attendance/check-out",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(checkOutData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check out");
      }

      console.log("Check-out successful");

      await fetchAttendanceStatus();
    } catch (err) {
      console.error("Check-out error:", err);
      setError(err.message || "Failed to check out");
    } finally {
      setLoading(false);
    }
  };

  const isCheckInDisabled = () => {
    return loading || (
      attendanceData && 
      attendanceData.is_checked_in && 
      !attendanceData.is_checked_out && 
      isCurrentAttendanceFromToday()
    );
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    const maxPage = Math.ceil(attendanceHistory.length / itemsPerPage);
    setCurrentPage(prev => Math.min(prev + 1, maxPage));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      {isAdminOrManager() && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={toggleView}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            <LayoutGrid size={16} />
            <span>{showOverview ? 'Switch to Personal View' : 'Switch to Overview'}</span>
          </button>
        </div>
      )}
      
      {showOverview && isAdminOrManager() ? (
        <AttendanceOverview />
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={handleCheckIn}
              disabled={isCheckInDisabled()}
              className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-6 py-2 rounded-md disabled:opacity-50 w-48"
            >
              <Clock size={18} /> 
              {loading && !attendanceData?.is_checked_in ? "Processing..." : "Check In"}
            </button>
            
            <div className="flex flex-col items-center">
              <div className="text-gray-600 text-xl font-semibold animate-pulse">
                <Clock size={18} className="inline-block mr-2" />
                {currentTime}
              </div>
              
              {attendanceData?.is_checked_in && !attendanceData?.is_checked_out && (
                <div className="text-sm text-indigo-600 mt-1">
                  Working: {workingHours}h {workingMinutes}m
                </div>
              )}
            </div>
            
            <button 
              onClick={handleCheckOut}
              disabled={loading || !attendanceData || !attendanceData.is_checked_in || attendanceData.is_checked_out}
              className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-6 py-2 rounded-md disabled:opacity-50 w-48"
            >
              {loading && attendanceData?.is_checked_in && !attendanceData?.is_checked_out ? "Processing..." : "Check Out"}
              <Clock size={18} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-3 px-4 text-left w-1/4">Day</th>
                  <th className="py-3 px-4 text-center w-1/4">Check-In Time</th>
                  <th className="py-3 px-4 text-center w-1/4">Check-Out Time</th>
                  <th className="py-3 px-4 text-right w-1/4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record, index) => (
                    <tr 
                      key={index} 
                      className={`${index === 0 ? 'bg-indigo-500 text-white rounded-lg' : ''}`}
                    >
                      <td className="py-4 px-4 font-medium flex items-center gap-2">
                        <div className="rounded-full bg-white p-1">
                          <Clock size={18} className={index === 0 ? 'text-indigo-500' : 'text-black'} />
                        </div>
                        {formatDate(record.day)}
                      </td>
                      <td className="py-4 px-4 text-center">{formatTime(record.checkInTime)}</td>
                      <td className="py-4 px-4 text-center">{record.checkOutTime === 'Working...' ? 'Working...' : formatTime(record.checkOutTime)}</td>
                      <td className="py-4 px-4 text-right">{record.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                      No attendance records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {attendanceHistory.length > 0 && (
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border rounded p-1"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, attendanceHistory.length)} out of {attendanceHistory.length} records
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="p-1 rounded border"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <button className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  1
                </button>
                
                <button className="h-8 w-8 rounded-full text-gray-600 flex items-center justify-center">
                  2
                </button>
                
                <button className="h-8 w-8 rounded-full text-gray-600 flex items-center justify-center">
                  3
                </button>
                
                <button className="h-8 w-8 rounded-full text-gray-600 flex items-center justify-center">
                  4
                </button>
                
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(attendanceHistory.length / itemsPerPage)}
                  className="p-1 rounded border"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendancePage;