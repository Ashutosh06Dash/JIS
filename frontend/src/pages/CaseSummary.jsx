import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/Api";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { jwtDecode } from "jwt-decode";

const CaseSummaryPage = () => {
  const { cin } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [caseDetails, setCaseDetails] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
    
    fetchCaseAndSummaries();
  }, [cin]);

  const fetchCaseAndSummaries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }
      
      const decoded = jwtDecode(token);
      const role = decoded.role.toLowerCase();
      
      let caseData = null;
      let errorMessage = null;
      
      // For lawyers, use specific endpoint that adds billing
      if (role === 'lawyer') {
        try {
          // Make sure to include case ID correctly
          const res = await api.get(`/lawyer/cases/${cin}`);
          
          if (res.data && res.data.case) {
            caseData = res.data.case;
          }
        } catch (err) {
          console.log(`Error using lawyer/cases/${cin} endpoint:`, err);
          if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("Response data:", err.response.data);
            console.log("Response status:", err.response.status);
            errorMessage = err.response.data.message || err.message;
          } else if (err.request) {
            // The request was made but no response was received
            console.log("No response received:", err.request);
            errorMessage = "No response from server";
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error message:', err.message);
            errorMessage = err.message;
          }
        }
      } else {
        // For other roles, try case query endpoint
        try {
          const url = `/${role}/case-query/${cin}`;
          const res = await api.get(url);
          
          if (res.data && res.data.case) {
            caseData = res.data.case;
          }
        } catch (err) {
          console.log(`Error using ${role}/case-query/${cin} endpoint:`, err);
          errorMessage = err.response?.data?.message || err.message;
        }
      }
      
      // If no case yet, try generic case endpoint
      if (!caseData && role === 'lawyer') {
        try {
          const url = `/${role}/cases/${cin}`;
          const res = await api.get(url);
          
          if (res.data && res.data.case) {
            caseData = res.data.case;
          }
        } catch (err) {
          console.log(`Error using /case/${cin} endpoint:`, err);
          errorMessage = errorMessage || err.message;
        }
      }
      
      // Last attempt: try cases endpoint filtered by CIN
      if (!caseData) {
        try {
          const status = role === 'lawyer' ? 'resolved' : 'pending';
          const url = `/${role}/cases/${status}`;
          const res = await api.get(url);
          
          if (res.data) {
            const cases = Array.isArray(res.data) ? res.data : 
                         (res.data.cases && Array.isArray(res.data.cases) ? res.data.cases : []);
            
            const matchingCase = cases.find(c => c.cin === cin);
            if (matchingCase) {
              caseData = matchingCase;
            }
          }
        } catch (err) {
          console.log(`Error using /${role}/cases endpoint:`, err);
          errorMessage = errorMessage || err.message;
        }
      }
      
      if (caseData) {
        setCaseDetails(caseData);
        
        if (caseData.summaries && Array.isArray(caseData.summaries)) {
          const sortedSummaries = [...caseData.summaries].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setSummaries(sortedSummaries);
        } else {
          try {
            const summariesRes = await api.get(`/case/${cin}/summary`);
            if (summariesRes.data && summariesRes.data.summaries) {
              const sortedSummaries = [...summariesRes.data.summaries].sort(
                (a, b) => new Date(b.createdAt || b.summaryDate) - new Date(a.createdAt || a.summaryDate)
              );
              setSummaries(sortedSummaries);
            } else {
              setSummaries([]);
            }
          } catch (err) {
            console.log("Error fetching separate summaries:", err);
            setSummaries([]);
          }
        }
      } else {
        setCaseDetails(null);
        setSummaries([]);
        setError("Case details not found. " + (errorMessage ? `Error: ${errorMessage}` : ""));
      }
    } catch (err) {
      setError("Error fetching case information. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getBackUrl = () => {
    switch (userRole) {
      case "REGISTRAR":
        return "/registrar/query-case";
      case "JUDGE":
        return "/judge/query-case";
      case "LAWYER":
        return "/lawyer/query-case";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Link to={getBackUrl()} className="text-primary hover:text-primary-dark flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Cases
            </Link>
          </div>

          <header className="mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Case Summaries
            </h2>
            <p className="text-gray-600 mt-1">
              {caseDetails ? `CIN: ${caseDetails.cin}` : "Loading case details..."}
            </p>
          </header>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {caseDetails && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Case Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Defendant</p>
                      <p className="font-medium">{caseDetails.defendantName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Crime Type</p>
                      <p className="font-medium">{caseDetails.crimeType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Crime Date</p>
                      <p className="font-medium">{formatDate(caseDetails.crimeDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Crime Location</p>
                      <p className="font-medium">{caseDetails.crimeLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          caseDetails.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {caseDetails.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(caseDetails.caseStartDate)}</p>
                    </div>
                    
                    {caseDetails.hearings && caseDetails.hearings.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Next Hearing Date</p>
                        <p className="font-medium">
                          {(() => {
                            // Find future hearings and get the next one
                            const today = new Date();
                            const futureHearings = caseDetails.hearings
                              .filter(h => new Date(h.hearingDate) >= today)
                              .sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));
                              
                            if (futureHearings.length > 0) {
                              return formatDate(futureHearings[0].hearingDate);
                            }
                            return "Not scheduled";
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <h3 className="text-xl font-semibold">Summaries</h3>
                </div>
                
                {summaries.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No summaries available for this case.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {summaries.map((summary, index) => (
                      <div key={summary.id || index} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-500">
                            {formatDate(summary.createdAt || summary.summaryDate)}
                          </p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">{summary.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseSummaryPage; 