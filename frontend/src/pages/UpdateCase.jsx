import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/Api';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { AuthContext } from '../components/AuthContext';

const UpdateCase = () => {
  const { cin } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [caseData, setCaseData] = useState({
    cin: '',
    status: 'PENDING',
    hearingDate: '',
    caseSummary: '',
    caseDescription: '',
    currentHearingDate: '' // Store the original hearing date for comparison
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState([]);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await api.get(`/registrar/case-query/${cin}`);
        if (res.data.case) {
          const caseDetails = res.data.case;
          
          // Get the latest summary if available
          let latestSummary = '';
          if (caseDetails.summaries && caseDetails.summaries.length > 0) {
            // Sort by createdAt date and get the latest
            const sortedSummaries = [...caseDetails.summaries].sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            latestSummary = sortedSummaries[0].content;
          }
          
          // Get the next scheduled hearing date, if any
          let nextHearingDate = '';
          if (caseDetails.hearings && caseDetails.hearings.length > 0) {
            const futureHearings = caseDetails.hearings
              .filter(h => new Date(h.hearingDate) > new Date())
              .sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));
            
            if (futureHearings.length > 0) {
              nextHearingDate = new Date(futureHearings[0].hearingDate).toISOString().split('T')[0];
            }
          }
          
          // Save the current hearing date for later freeing when updating
          const currentHearingDate = nextHearingDate;
          
          // Format date for form input (YYYY-MM-DD)
          let formattedCase = { 
            cin: caseDetails.cin,
            status: caseDetails.status || 'PENDING',
            hearingDate: nextHearingDate,
            caseSummary: latestSummary,
            caseDescription: caseDetails.caseDescription || '',
            currentHearingDate: currentHearingDate // Store for comparison when updating
          };
          
          setCaseData(formattedCase);
          
          // Determine if view only based on user role or case status
          try {
            const token = user.token;
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userRole = payload.role.toLowerCase();
            setIsViewOnly(userRole !== 'registrar' || caseDetails.status === 'RESOLVED');
          } catch (err) {
            console.error("Error parsing token:", err);
            setIsViewOnly(true);
          }
        } else {
          setError('Case not found');
        }
      } catch (err) {
        setError('Error fetching case details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch occupied dates for the current month/year
    const fetchOccupiedDates = async () => {
      const today = new Date();
      try {
        const res = await api.get(
          `/registrar/hearing-dates?month=${today.getMonth() + 1}&year=${today.getFullYear()}`
        );
        
        // Process the occupied dates
        const processedDates = processOccupiedDates(res.data.dates, today);
        setOccupiedDates(processedDates);
      } catch (err) {
        console.error("Error fetching occupied dates", err);
      }
    };
    
    // Helper function to process occupied dates
    const processOccupiedDates = (dates, today) => {
      // Get current date components
      const currentDate = today.getDate();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      
      // Filter out past dates to show them as free
      return dates.map(date => {
        // If the date is in the past, mark it as unoccupied (free)
        if (date.day < currentDate && 
            today.getMonth() + 1 === currentMonth && 
            today.getFullYear() === currentYear) {
          return { ...date, occupied: false };
        }
        
        // Special case: if this is the current hearing date of the case being edited,
        // we should show it as available (we'll free it when updating)
        if (caseData.currentHearingDate) {
          const currentHearingDate = new Date(caseData.currentHearingDate);
          if (currentHearingDate.getDate() === date.day && 
              currentHearingDate.getMonth() + 1 === currentMonth && 
              currentHearingDate.getFullYear() === currentYear) {
            return { ...date, occupied: false };
          }
        }
        
        return date;
      });
    };

    fetchCase();
    fetchOccupiedDates();
  }, [cin, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle status enum
    if (name === 'status') {
      setCaseData({ ...caseData, [name]: value.toUpperCase() });
    } else {
      setCaseData({ ...caseData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Ensure hearing date is not in the past for pending cases
      if (caseData.status === 'PENDING' && caseData.hearingDate && caseData.hearingDate < currentDate) {
        setError('Hearing date cannot be in the past. Please select today or a future date.');
        setLoading(false);
        return;
      }
      
      // Check if the selected date is different from current hearing date
      const isHearingDateChanged = caseData.hearingDate !== caseData.currentHearingDate;
      
      // Prepare data for submission
      const updateData = {
        status: caseData.status,
        summary: caseData.caseSummary,
        nextHearingDate: caseData.hearingDate,
        // If we're changing the hearing date, include oldHearingDate to free it
        oldHearingDate: isHearingDateChanged ? caseData.currentHearingDate : undefined
      };
      
      // Update the case
      const response = await api.put(`/registrar/case-updation/${cin}`, updateData);
      setSuccess('Case updated successfully');
      
      // Navigate back to query page after a delay
      setTimeout(() => {
        navigate('/registrar/query-case');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating case');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const disableBeforeTodayDates = () => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  };

  const isDateOccupied = (date) => {
    if (!date || !occupiedDates || occupiedDates.length === 0) return false;
    
    const selectedDate = new Date(date);
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    
    // Check if this day is in the occupied dates list
    const dateInfo = occupiedDates.find(d => d.day === day);
    
    // If it's a past date, it should be shown as free
    const today = new Date();
    if (selectedDate < today) {
      return false;
    }
    
    // If it's the current hearing date of this case, it should be shown as free
    // (since we'll be freeing it)
    if (caseData.currentHearingDate === date) {
      return false;
    }
    
    return dateInfo && dateInfo.occupied;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {isViewOnly ? "View Case" : "Update Case"}: {caseData.cin}
            </h2>
            <Link to="/registrar/query-case">
              <Button 
                variant="outline" 
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                Back to Cases
              </Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p>{success}</p>
            </div>
          )}

          {isViewOnly && (
            <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>
                  {caseData.status === 'RESOLVED' 
                    ? "This case is already resolved. Details are view-only." 
                    : "You are viewing this case in read-only mode."}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : !error && (
            <div className="bg-white rounded-lg shadow-lg border border-indigo-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="CIN"
                    name="cin"
                    value={caseData.cin}
                    onChange={handleChange}
                    disabled={true}
                    required={true}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={caseData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      disabled={isViewOnly}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Hearing Date {isDateOccupied(caseData.hearingDate) && !isViewOnly && 
                        <span className="text-sm text-red-600 ml-2">(Date is occupied)</span>
                      }
                    </label>
                    <input
                      type="date"
                      name="hearingDate"
                      value={caseData.hearingDate}
                      onChange={handleChange}
                      min={caseData.status === 'PENDING' ? disableBeforeTodayDates() : undefined}
                      className={`w-full border ${isDateOccupied(caseData.hearingDate) && !isViewOnly ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                      disabled={isViewOnly || caseData.status === 'RESOLVED'}
                    />
                    {!isViewOnly && caseData.currentHearingDate && caseData.hearingDate !== caseData.currentHearingDate && (
                      <p className="mt-2 text-sm text-indigo-600">
                        Current hearing date will be freed and new date will be occupied
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Case Description
                  </label>
                  <textarea
                    name="caseDescription"
                    value={caseData.caseDescription || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    disabled={isViewOnly}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {caseData.status === 'RESOLVED' ? 'Final Case Summary' : 'Case Summary for Current Hearing'}
                  </label>
                  <textarea
                    name="caseSummary"
                    value={caseData.caseSummary || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required={!isViewOnly}
                    disabled={isViewOnly}
                  ></textarea>
                </div>
                
                {!isViewOnly && (
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transform hover:scale-[1.02] transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Case'}
                    </Button>
                  </div>
                )}
              </form>

              {/* Occupied Dates Display */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Occupied Hearing Dates for this Month
                </h3>
                {occupiedDates.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {occupiedDates.map((dateInfo, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded-md text-center ${dateInfo.occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                      >
                        Day {dateInfo.day}: {dateInfo.occupied ? "Occupied" : "Free"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Loading available dates...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateCase;
