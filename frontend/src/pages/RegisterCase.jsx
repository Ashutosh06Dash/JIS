import React, { useState, useEffect } from "react";
import api from "../services/Api";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";

const RegisterCase = () => {
  const [formData, setFormData] = useState({
    defendantName: "",
    defendantAddress: "",
    crimeType: "",
    crimeDate: "",
    crimeLocation: "",
    arrestingOfficer: "",
    arrestDate: "",
    hearingDate: ""
  });
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOccupiedDates = async () => {
      const today = new Date();
      try {
        const res = await api.get(
          `/registrar/hearing-dates?month=${today.getMonth() + 1}&year=${today.getFullYear()}`
        );
        setOccupiedDates(res.data.dates);
      } catch (err) {
        console.error("Error fetching occupied dates", err);
      }
    };
    fetchOccupiedDates();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isDateOccupied = (date) => {
    if (!date || !occupiedDates || occupiedDates.length === 0) return false;
    
    const selectedDate = new Date(date);
    const day = selectedDate.getDate();
    
    // Find if this day is in the occupied dates list
    const dateInfo = occupiedDates.find(d => d.day === day);
    return dateInfo && dateInfo.occupied;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const res = await api.post("/registrar/case-creation", formData);
      setMessage("Case registered successfully! CIN: " + res.data.case.cin);
      // Reset form after successful submission
      setFormData({
        defendantName: "",
        defendantAddress: "",
        crimeType: "",
        crimeDate: "",
        crimeLocation: "",
        arrestingOfficer: "",
        arrestDate: "",
        hearingDate: ""
      });
    } catch (err) {
      setError("Error registering case: " + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            Register New Case
          </h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p>{message}</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-lg border border-indigo-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Defendant Name"
                    name="defendantName"
                    value={formData.defendantName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Defendant Address"
                    name="defendantAddress"
                    value={formData.defendantAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Crime Type"
                    name="crimeType"
                    value={formData.crimeType}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Crime Location"
                    name="crimeLocation"
                    value={formData.crimeLocation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Crime Date
                  </label>
                  <input
                    type="date"
                    name="crimeDate"
                    value={formData.crimeDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Arrest Date
                  </label>
                  <input
                    type="date"
                    name="arrestDate"
                    value={formData.arrestDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Arresting Officer
                </label>
                <input
                  type="text"
                  name="arrestingOfficer"
                  value={formData.arrestingOfficer}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hearing Date {isDateOccupied(formData.hearingDate) && 
                    <span className="text-sm text-red-600 ml-2">(Date is occupied)</span>
                  }
                </label>
                <input
                  type="date"
                  name="hearingDate"
                  value={formData.hearingDate}
                  onChange={handleChange}
                  className={`w-full border ${isDateOccupied(formData.hearingDate) ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                  required
                />
                {isDateOccupied(formData.hearingDate) && (
                  <p className="mt-1 text-sm text-red-600">Warning: This date already has hearings scheduled.</p>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transform hover:scale-[1.02] transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register Case'}
                </Button>
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default RegisterCase;
