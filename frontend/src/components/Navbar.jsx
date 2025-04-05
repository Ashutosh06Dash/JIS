import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    if (user) {
      handleRedirectBasedOnRole();
    } else {
      navigate('/');
    }
  };

  const handleRedirectBasedOnRole = () => {
    try {
      const decoded = jwtDecode(user.token);
      const role = decoded.role.toLowerCase();
      if (role === "registrar") {
        navigate("/registrar/dashboard");
      } else if (role === "judge") {
        navigate("/judge/dashboard");
      } else if (role === "lawyer") {
        navigate("/lawyer/dashboard");
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      navigate("/");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link 
          to={user ? "#" : "/"} 
          className="text-2xl font-bold tracking-tight flex items-center transition-transform hover:scale-105"
          onClick={user ? handleHomeClick : undefined}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
          </svg>
          <span className="font-bold">Judiciary Information System</span>
        </Link>
        <div className="flex items-center space-x-5">
          {user && (
            <button 
              className="px-4 py-2 rounded-md hover:bg-white/20 transition-colors duration-200 flex items-center" 
              onClick={handleHomeClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </button>
          )}
          {user ? (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition-colors duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </div>
            </button>
          ) : (
            !isLandingPage && (
              <Link 
                className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition-colors duration-200 shadow-sm hover:shadow" 
                to="/login"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm9.293 9.293a1 1 0 001.414-1.414L12.414 9.5l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3z" clipRule="evenodd" />
                  </svg>
                  Login
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
