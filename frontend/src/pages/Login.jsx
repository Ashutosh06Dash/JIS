import React, { useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/Api";
import { AuthContext } from "../components/AuthContext";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ userName: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(role || "registrar");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      let res;
      
      // Try to authenticate based on the active role tab
      try {
        if (activeRole === "registrar") {
          res = await api.post("/registrar/login", formData);
        } else if (activeRole === "judge") {
          res = await api.post("/judge/login", formData);
        } else if (activeRole === "lawyer") {
          res = await api.post("/lawyer/login", formData);
        }
      } catch (err) {
        throw new Error("Authentication failed");
      }
      
      // If we get here, login succeeded
      console.log("Login response:", res.data);
      
      // Decode the token to get the user's role
      const tokenData = jwtDecode(res.data.token);
      console.log("Decoded token:", tokenData);
      
      // Store the token and redirect to the appropriate dashboard
      login(res.data.token);
      
      const userRole = tokenData.role.toLowerCase();
      if (userRole === "registrar") navigate("/registrar/dashboard");
      else if (userRole === "judge") navigate("/judge/dashboard");
      else if (userRole === "lawyer") navigate("/lawyer/dashboard");
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    if (roleName === "registrar") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    } else if (roleName === "judge") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      );
    } else if (roleName === "lawyer") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getRoleBgClass = (roleName) => {
    if (roleName === "registrar") {
      return "bg-gradient-to-r from-indigo-600 to-blue-600";
    } else if (roleName === "judge") {
      return "bg-gradient-to-r from-purple-600 to-pink-600";
    } else if (roleName === "lawyer") {
      return "bg-gradient-to-r from-blue-600 to-teal-600";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="flex-grow flex justify-center items-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-indigo-100 p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className={`h-20 w-20 rounded-full ${getRoleBgClass(activeRole)} flex items-center justify-center shadow-lg transform transition-all duration-300`}>
                {getRoleIcon(activeRole)}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-2">Please select your role and enter your credentials</p>
          </div>
          
          {/* Role selection tabs */}
          <div className="flex mb-8 rounded-lg overflow-hidden shadow-md">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                activeRole === "registrar" 
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveRole("registrar")}
            >
              Registrar
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                activeRole === "judge" 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveRole("judge")}
            >
              Judge
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                activeRole === "lawyer" 
                  ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveRole("lawyer")}
            >
              Lawyer
            </button>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200 shadow-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required={true}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={true}
            />
            <div className="pt-2">
              <Button 
                type="submit" 
                className={`w-full mt-2 ${getRoleBgClass(activeRole)} hover:opacity-90 transform hover:scale-[1.02] transition-all duration-200`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            {activeRole === "registrar" && (
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-indigo-600 hover:text-purple-600 font-medium hover:underline transition-colors">
                  Sign Up
                </Link>
              </p>
            )}
            {activeRole !== "registrar" && (
              <p className="text-gray-600">
                Only registrars can sign up. Please contact the administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
