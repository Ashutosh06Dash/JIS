import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/Api";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

const QueryCase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "PENDING", date: "", cin: "" });
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    // Get user role from token when component mounts
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.role) {
          // Store the original case from backend for API calls
          setUserRole(decoded.role);
          console.log("User role from token:", decoded.role);
          
          // If lawyer, set default status to RESOLVED
          if (decoded.role.toLowerCase() === "lawyer") {
            setFilters(prev => ({ ...prev, status: "RESOLVED" }));
          }
        }
      }
    } catch (e) {
      console.error("Error decoding token:", e);
    }

    // Parse query parameters
    const params = new URLSearchParams(location.search);
    if (params.get("status")) {
      setFilters(prev => ({ ...prev, status: params.get("status").toUpperCase() }));
    }
    if (params.get("date")) {
      setFilters(prev => ({ ...prev, date: params.get("date") }));
    }
    
    // Determine if we're in update mode based on the current path
    // Update mode is only when path is explicitly /registrar/query-case without status params
    // If there's a status param, we're in report/view mode
    const isInUpdateMode = location.pathname === "/registrar/query-case" && 
                         !params.get("status") && 
                         userRole.toLowerCase() === "registrar";
    setIsUpdateMode(isInUpdateMode);
    
  }, [location, userRole]);

  const handleChange = (e) => {
    const value = e.target.name === "status" ? e.target.value.toUpperCase() : e.target.value;
    setFilters({ ...filters, [e.target.name]: value });
  };

  const handleQuery = async () => {
    setLoading(true);
    setError("");
    setCases([]);
    
    try {
      let url;
      let role = userRole || "REGISTRAR"; // Use the stored role with original case
      
      // Keep role in original case from backend for API path
      const apiRole = role.toLowerCase();
      console.log("API role:", apiRole);
      console.log("Status filter:", filters.status);
      
      if (filters.cin) {
        // Search by CIN
        url = `/${apiRole}/case-query/${filters.cin}`;
      } else {
        // Search by status and optionally date
        // Keep status in the case expected by the backend (lowercase)
        url = `/${apiRole}/cases/${filters.status.toLowerCase()}`;
        if (filters.date) {
          // Format date properly for the API
          const formattedDate = new Date(filters.date).toISOString().split('T')[0];
          url += `?date=${formattedDate}`;
        }
      }
      
      console.log("Querying URL:", url);
      
      const res = await api.get(url);
      console.log("API response:", res.data);
      
      let caseResults = [];
      if (res.data && Array.isArray(res.data)) {
        caseResults = res.data;
      } else if (res.data && res.data.cases && Array.isArray(res.data.cases)) {
        caseResults = res.data.cases;
      } else if (res.data && res.data.case) {
        // Single case result with summaries included
        const caseWithSummaries = res.data.case;
        caseResults = [caseWithSummaries];
      } else {
        caseResults = [];
      }
      
      // Process each case to extract the next hearing date
      const processedCases = caseResults.map(caseItem => {
        let nextHearingDate = null;
        
        // If case has hearings array, find the next hearing date
        if (caseItem.hearings && Array.isArray(caseItem.hearings) && caseItem.hearings.length > 0) {
          // Filter future hearings and sort by date (ascending)
          const today = new Date();
          const futureHearings = caseItem.hearings
            .filter(h => new Date(h.hearingDate) >= today)
            .sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));
            
          if (futureHearings.length > 0) {
            nextHearingDate = futureHearings[0].hearingDate;
          }
        }
        
        // Return case with the next hearing date set (if found)
        return {
          ...caseItem,
          hearingDate: nextHearingDate || caseItem.hearingDate || caseItem.nextHearingDate
        };
      });
      
      if (processedCases.length > 0) {
        setCases(processedCases);
      } else {
        setError("No cases found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error retrieving cases");
      console.error("Query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCaseStatus = (status) => {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const viewCaseDetails = (cin) => {
    // Only registrars can go to update case
    const role = userRole.toLowerCase();
    if (role === "registrar") {
      navigate(`/registrar/update-case/${cin}`);
    }
  };
  
  const viewSummary = (caseItem) => {
    // Process summaries if available
    if (caseItem.summaries && caseItem.summaries.length > 0) {
      // Sort by creation date, newest first
      const sortedSummaries = [...caseItem.summaries].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Create a case object with the latest summary and its date
      const caseWithLatestSummary = {
        ...caseItem,
        latestSummary: sortedSummaries[0].content,
        summaryDate: sortedSummaries[0].createdAt
      };
      
      setSelectedCase(caseWithLatestSummary);
    } else {
      // No summaries, just show the case
      setSelectedCase(caseItem);
    }
  };

  // Check if user is a lawyer
  const isLawyer = userRole.toLowerCase() === "lawyer";
  const isRegistrar = userRole.toLowerCase() === "registrar";
  const isJudge = userRole.toLowerCase() === "judge";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            {isUpdateMode ? "Update Case" : "Search Cases"}
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg border border-indigo-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {!isLawyer && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status:</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              )}
              {isLawyer && (
                <div>
                  <p className="block text-gray-700 font-medium mb-2">Status: <span className="text-green-600 font-semibold">Resolved</span></p>
                  <p className="text-sm text-gray-500">Lawyers can only view resolved cases</p>
                </div>
              )}
              <Input label="Date" name="date" type="date" value={filters.date} onChange={handleChange} />
            </div>
            
            {!isLawyer && (
              <div className="mb-4">
                <Input 
                  label="Case Identification Number (CIN)" 
                  name="cin" 
                  placeholder="Enter CIN for direct search" 
                  value={filters.cin} 
                  onChange={handleChange} 
                />
                <p className="text-sm text-gray-500 mt-1">
                  Note: If CIN is provided, status and date filters will be ignored
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleQuery} 
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transform hover:scale-[1.02] transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </div>
                ) : "Search Cases"}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {selectedCase && (
            <div className="bg-white rounded-lg shadow-lg border border-indigo-100 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Case Details: {selectedCase.cin}
                </h3>
                <Button 
                  variant="outline" 
                  className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setSelectedCase(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className={`font-medium text-lg ${
                    selectedCase.status === "PENDING" ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {formatCaseStatus(selectedCase.status)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Case Summary</p>
                  <p className="font-medium">
                    {selectedCase.latestSummary || 
                     (selectedCase.summaries && selectedCase.summaries.length > 0 ? 
                      selectedCase.summaries[selectedCase.summaries.length - 1].content : 
                      "No summary available")}
                  </p>
                  {selectedCase.summaryDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(selectedCase.summaryDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Hearing Date</p>
                  <p className="font-medium text-lg">{formatDate(selectedCase.hearingDate)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Defendant</p>
                  <p className="font-medium text-lg">{selectedCase.defendantName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Crime Type</p>
                  <p className="font-medium text-lg">{selectedCase.crimeType}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Case Description</p>
                  <p className="font-medium">
                    {selectedCase.caseDescription || "No description available."}
                  </p>
                </div>
              </div>
              
              {isUpdateMode && isRegistrar && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={() => viewCaseDetails(selectedCase.cin)} 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                  >
                    Update Case
                  </Button>
                </div>
              )}
              
              <div className="mt-6">
                <Link 
                  to={`/case-summary/${selectedCase.cin}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-teal-100 text-teal-700 border border-teal-300 rounded-md hover:bg-teal-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  View Full Case Summary
                </Link>
              </div>
            </div>
          )}
          
          {!loading && cases.length > 0 && !selectedCase && (
            <div className="bg-white rounded-lg shadow-lg border border-indigo-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">Search Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hearing Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defendant</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cases.map((caseItem) => (
                      <tr key={caseItem.cin} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{caseItem.cin}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            caseItem.status === "PENDING" ? "text-yellow-600" : "text-green-600"
                          } font-medium`}>
                            {formatCaseStatus(caseItem.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(caseItem.hearingDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {caseItem.defendantName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="text"
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            onClick={() => viewSummary(caseItem)}
                          >
                            View Details
                          </Button>
                          
                          {isRegistrar && isUpdateMode && caseItem.status !== "RESOLVED" && (
                            <Link to={`/registrar/update-case/${caseItem.cin}`} className="text-purple-600 hover:text-purple-800 mx-2">
                              Update
                            </Link>
                          )}
                          
                          <Link to={`/case-summary/${caseItem.cin}`} className="text-teal-600 hover:text-teal-800 ml-2">
                            Full Summary
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {!loading && cases.length === 0 && !error && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No cases found</h3>
              <p className="mt-2 text-gray-500">Try changing your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryCase;
