// filepath: d:\React\hr-erp-frontend\src\App.js
import React from "react";
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

function App() {
  const isAuthenticated = () => authService.isAuthenticated();

  // Helper function to check if user has required role
  const hasRole = (requiredRoles) => {
    if (!isAuthenticated()) return false;

    try {
      const userRole = authService.getUserRole() || "Employee";

      // Case insensitive role checking
      return requiredRoles.some(
        (role) => role.toLowerCase() === userRole.toLowerCase()
      );
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  };

  // ProtectedRoute component with role checking
  const ProtectedRoute = ({
    element,
    requiredRoles = ["Admin", "Manager", "Account", "Employee"],
  }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }

    if (!hasRole(requiredRoles)) {
      return (
        <Forbiden
          message={`You need ${requiredRoles.join(
            " or "
          )} role to access this page`}
        />
      );
    }

    return element;
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
              <ProtectedRoute
                element={<Dashboard />}
                requiredRoles={["Admin", "Manager", "Account", "Employee"]}
              />
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute
                element={<AllEmployees />}
                requiredRoles={["Admin"]}
              />
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
              isAuthenticated() && isAdminOrManager() ? (
                <LeaveApprovalPage />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />
            }
          />
          <Route
            path="/projects/*"
            element={
              <ProtectedRoute
                element={<Project />}
                requiredRoles={["Admin", "Manager"]}
              />
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute
                element={<UserProfilePage />}
                requiredRoles={["Admin", "Manager", "Account", "Employee"]}
              />
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute
                element={<MyTasksPage />}
                requiredRoles={["Employee", "Manager"]}
              />
            }
          />
          <Route path="/forbidden" element={<Forbiden />} />
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />
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
