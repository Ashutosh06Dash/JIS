import React, { useEffect, useState } from "react";
import api from "../services/Api";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../config.js";

const ViewBillPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [billAmount, setBillAmount] = useState(0);
  const [billStatus, setBillStatus] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.userName) {
          setUserName(decoded.userName);
        }
        if (decoded.name) {
          setName(decoded.name);
        } else {
          // If name is not in the token, capitalize the first letter of userName
          setName(decoded.userName.charAt(0).toUpperCase() + decoded.userName.slice(1));
        }
        if (decoded.role) {
          setRole(decoded.role);
        }
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
    
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view billing details");
        setLoading(false);
        return;
      }

      // Use the exact endpoint from the backend lawyer.js route
      const response = await fetch(`${BASE_URL}/lawyer/bill`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch billing information");
      }

      const data = await response.json();
      
      // Based on the lawyer.js route, data should contain {bills} array
      if (data && data.bills && Array.isArray(data.bills)) {
        // Process bills to have consistent structure
        const processedBills = data.bills.map(bill => ({
          id: bill.id || '',
          cin: bill.case?.cin || 'Unknown',
          amount: parseFloat(bill.chargeAmount || 0),
          date: bill.createdAt || new Date().toISOString(),
          paymentStatus: bill.paymentStatus || 'PENDING'
        }));
        console.log(processedBills)
        setBills(processedBills);
      } else {
        // Handle if response format is different
        setBills([]);
      }
      
      setError("");
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("Failed to load billing information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      if (!userName) {
        setError("Cannot identify lawyer. Please try again later.");
        setLoading(false);
        return;
      }
      
      // Use the pay-bill endpoint
      const response = await fetch(`${BASE_URL}/lawyer/pay-bill`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to process payment");
      }
      
      setSuccess("Payment processed successfully!");
      
      // Refresh bills to show updated status
      fetchBills();
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Error processing payment. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return bills
      .filter(bill => bill.paymentStatus !== "PAID")
      .reduce((total, bill) => total + bill.amount, 0)
      .toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const hasPendingBills = () => {
    return bills.some(bill => bill.paymentStatus !== "PAID");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getBillStatusDisplay = () => {
    switch (billStatus.toUpperCase()) {
      case "PAID":
        return {
          text: "Paid",
          color: "bg-green-100 text-green-800 border-green-200",
        };
      case "PENDING":
        return {
          text: "Payment Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      default:
        return {
          text: billStatus,
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {name ? `${name}'s Billing Details` : "Billing Details"}
            </h2>
            <p className="text-gray-600 mt-1">View and manage your bills</p>
          </header>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-xl text-gray-600">No billing records found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">Your Bills</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map((bill, index) => (
                      <tr key={bill.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {bill.cin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(bill.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            bill.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          ₹{bill.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        Total Outstanding:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-indigo-600">
                        ₹{calculateTotal()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {hasPendingBills() && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                    disabled={loading}
                  >
                    Process Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBillPage;
