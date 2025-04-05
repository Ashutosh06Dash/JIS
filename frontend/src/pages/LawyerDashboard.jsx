import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

const LawyerDashboard = () => {
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.userName) {
          setUserName(decoded.userName);
        }
        
        // Set the proper name with capitalization
        if (decoded.name) {
          setName(decoded.name);
        } else {
          // If name is not available in token, capitalize first letter of userName
          const formattedName = decoded.userName.charAt(0).toUpperCase() + decoded.userName.slice(1);
          setName(formattedName);
        }
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {name ? `Welcome, ${name}` : "Lawyer Dashboard"}
          </h2>
          <p className="text-gray-600 mt-2">Access your resolved cases and manage billing</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Case Management Card */}
          <div className="bg-white rounded-lg shadow-lg border border-indigo-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Case Management
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 mb-4">
                <p className="text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  As a lawyer, you can only view resolved cases
                </p>
              </div>
              <Link 
                to="/lawyer/query-case?status=resolved"
                className="flex items-center justify-between text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-3 rounded-md transition-colors font-medium"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  View Resolved Cases
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Billing Card */}
          <div className="bg-white rounded-lg shadow-lg border border-indigo-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Billing Management
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-purple-800 mb-4">
                <p className="text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  View your bills and payment status
                </p>
              </div>
              <Link 
                to="/lawyer/view-bill"
                className="flex items-center justify-between text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 p-3 rounded-md transition-colors font-medium"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  View and Pay Bills
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
