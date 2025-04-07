// filepath: d:\React\hr-erp-frontend\src\App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import AllEmployees from "./pages/AllEmployee";
import UserProfilePage from "./pages/UserProfilePage";
import Project from "./pages/Project";
import MyTasksPage from "../src/pages/MyTasksPage";
import Forbiden from "./components/common/Forbiden";
import authService from "./services/authService";
import LeaveRequestPage from "./pages/LeaveRequestPage";
import LeaveApprovalPage from "./pages/LeaveApprovalPage";
import AttendancePage from "./pages/Attendance";
import PayrollPage from "./pages/PayrollPage";
import ChatBox from './components/ChatBox';


const AuthenticatedLayout = ({ children }) => {
  return (
    <>
      {children}
      <ChatBox />
    </>
  );
};

function App() {
  // Debug: Log user info to check if role is correctly saved

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log("Current user data:", userData);

        // Kiểm tra cấu trúc dữ liệu để xác định vai trò
        const role = userData.user?.role || userData.role;
        console.log("Detected user role:", role);
        console.log(
          "Is admin or manager check:",
          role === "Admin" || role === "Manager"
        );
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      console.log("No user data in localStorage");
    }
  }, []);

  const isAuthenticated = () => {
    const isAuth = !!localStorage.getItem("user");
    console.log("isAuthenticated check result:", isAuth);
    return isAuth;
  };

  const hasRole = (role) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      // Cấu trúc có thể là { role } hoặc { user: { role } }
      const userRole = userData.user?.role || userData.role;
      const hasRoleResult = userRole === role;
      console.log(
        `hasRole('${role}') check result:`,
        hasRoleResult,
        "Detected role:",
        userRole
      );
      return hasRoleResult;
    } catch (error) {
      console.error("Error in hasRole:", error);
      return false;
    }
  };

  const isAdminOrAccountant = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userRole = userData.user?.role || userData.role;
      return userRole === "Admin" || userRole === "Accountant";
    } catch (error) {
      console.error("Error in isAdminOrAccountant:", error);
      return false;
    }
  };

  const isAdminOrManager = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      // Cấu trúc có thể là { role } hoặc { user: { role } }
      const userRole = userData.user?.role || userData.role;
      const isAdminManagerResult =
        userRole === "Admin" || userRole === "Manager";
      console.log(
        "isAdminOrManager check result:",
        isAdminManagerResult,
        "Detected role:",
        userRole
      );
      return isAdminManagerResult;
    } catch (error) {
      console.error("Error in isAdminOrManager:", error);
      return false;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated() ? (
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/employees"
            element={
              isAuthenticated() ? (
                isAdminOrManager() ? (
                  <AllEmployees />
                ) : (
                  <Forbiden message="Only administrators can access employee management." />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/leave-request"
            element={
              isAuthenticated() ? (
                <LeaveRequestPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/leave-approval"
            element={
              isAuthenticated() ? (
                isAdminOrManager() ? (
                  <LeaveApprovalPage />
                ) : (
                  <Forbiden message="Only managers and administrators can approve leave requests." />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/payroll"
            element={
              isAuthenticated() ? (
                isAdminOrManager() ? (
                  <PayrollPage />
                ) : (
                  <Forbiden message="Only accountants and administrators can access payroll information." />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/projects/*"
            element={
              isAuthenticated() ? (
                isAdminOrManager() ? (
                  <Project />
                ) : (
                  <Forbiden message="Only managers and administrators can access project management." />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated() ? <UserProfilePage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile/:id"
            element={
              isAuthenticated() ? <UserProfilePage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/attendance"
            element={
              isAuthenticated() ? <AttendancePage /> : <Navigate to="/login" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;