import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BASE_URL from "../config.js";

const ClearBills = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundLawyer, setFoundLawyer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSearchLawyer = async () => {
    if (!searchQuery.trim()) {
      setErrorMsg("Please enter a username to search");
      return;
    }

    setSearching(true);
    setErrorMsg("");
    setSuccessMsg("");
    setFoundLawyer(null);

    try {
      const token = localStorage.getItem("token");
      
      // Simply set the lawyer with the username for now
      // We'll check if it exists when clearing bills
      setFoundLawyer({
        username: searchQuery,
        billAmount: 10.0, // Default amount
        status: "PENDING"
      });
      
    } catch (error) {
      console.error("Error processing search:", error);
      setErrorMsg(error.message || "Failed to process search. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleClearBills = async () => {
    if (!searchQuery.trim()) {
      setErrorMsg("Please enter a username first");
      return;
    }

    setClearing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const clearBillEndpoint = `${BASE_URL}/registrar/clear-bill/${searchQuery}`;
      console.log("Calling clear-bill endpoint:", clearBillEndpoint);
      
      const response = await fetch(clearBillEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Lawyer not found with the given username");
        } else {
          throw new Error("Failed to clear bills");
        }
      }

      const result = await response.json();
      console.log("Clear bills result:", result);

      // Update the found lawyer with cleared bill
      setFoundLawyer({
        username: searchQuery,
        billAmount: 0,
        status: "PAID"
      });

      setSuccessMsg(`Successfully cleared bills for ${searchQuery}. Updated ${result.updatedCount || 0} records.`);
    } catch (error) {
      console.error("Error clearing bills:", error);
      setErrorMsg(error.message || "Failed to clear bills. Please try again.");
      
      // If lawyer not found, clear the foundLawyer state
      if (error.message.includes("not found")) {
        setFoundLawyer(null);
      }
    } finally {
      setClearing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Clear Lawyer Bills
          </h2>
          <p className="text-gray-600 mt-2">
            Enter a lawyer username and clear their outstanding bills
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Search for Lawyer
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter lawyer username"
                className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSearchLawyer}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
              
              <button
                className="bg-green-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleClearBills}
                disabled={clearing || !searchQuery.trim()}
              >
                {clearing ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Clear Bills"
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-md">
                {successMsg}
              </div>
            )}
          </div>
        </div>

        {foundLawyer && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Lawyer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    Personal Details
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="block text-sm text-gray-500">Username</span>
                      <span className="font-medium text-gray-800">
                        {foundLawyer.username}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    Billing Details
                  </h4>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="block text-sm text-indigo-500">
                        Outstanding Amount
                      </span>
                      <span className="text-2xl font-bold text-indigo-700">
                        {formatCurrency(foundLawyer.billAmount || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-indigo-500">Status</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                        foundLawyer.status === "PAID" 
                          ? "bg-green-100 text-green-800"
                          : foundLawyer.billAmount === 0 
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {foundLawyer.status === "PAID" 
                          ? "Paid" 
                          : foundLawyer.billAmount === 0 
                            ? "No Bill" 
                            : "Payment Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClearBills;