// filepath: d:\React\hr-erp-frontend\src\components\Login.js
import React, { useState } from "react";
import authService from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("robertallen@example.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      window.location.href = "/dashboard"; // Redirect to dashboard or any other page
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 transition-transform duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="HRMS Logo" className="w-12 h-12 mr-4" />
          <h1 className="text-2xl font-semibold text-gray-800">HRMS Portal</h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-medium text-gray-800 mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm">
            Please enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ✉️
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔒
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-5">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Remember Me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition">
              Forgot Password?
            </a>
          </div>

          {error && (
            <div className="mb-5 p-2 bg-red-50 text-red-600 text-center text-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HRMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;