import React from 'react';
import Navbar from '../components/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-medium text-primary-dark mt-2">Page Not Found</h2>
          <p className="text-gray-600 mt-4">The page you are looking for does not exist.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 