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
import AttendancePage from "./pages/Attendance";

function App() {
  const isAuthenticated = () => !!localStorage.getItem("user"); // Using user from localStorage

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/employees"
            element={
              isAuthenticated() ? <AllEmployees /> : <Navigate to="/login" />
            }
          />
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
