import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl w-full p-8 m-4 bg-white rounded-lg shadow-lg border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
                Judiciary Information System
              </h1>
              <p className="text-lg text-gray-600">
                Streamlined case management for court registrars, judges, and lawyers.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-lg border border-indigo-200 shadow-inner">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Welcome</h2>
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Login to System
                </Link>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  *Only authorized court personnel should use this system
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  <Link to="/register" className="text-indigo-600 hover:text-purple-600 font-medium hover:underline transition-colors">
                    New registrar? Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
