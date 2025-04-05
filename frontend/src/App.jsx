import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./components/AuthContext";
import { jwtDecode } from "jwt-decode";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegistrarDashboard from "./pages/RegistrarDashboard";
import QueryCase from "./pages/QueryCase";
import RegisterCase from "./pages/RegisterCase";
import UpdateCase from "./pages/UpdateCase";
import CreateUser from "./pages/CreateUser";
import DeleteUser from "./pages/DeleteUser";
import JudgeDashboard from "./pages/JudgeDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import ViewBill from "./pages/ViewBill";
import NotFound from "./pages/NotFound";
import ClearBillsPage from "./pages/ClearBills";
import CaseSummaryPage from "./pages/CaseSummary";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// Authenticated route guard - redirects to dashboard if already logged in
const AuthRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      try {
        const decoded = jwtDecode(user.token);
        const role = decoded.role.toLowerCase();
        
        if (role === "registrar") {
          navigate("/registrar/dashboard", { replace: true });
        } else if (role === "judge") {
          navigate("/judge/dashboard", { replace: true });
        } else if (role === "lawyer") {
          navigate("/lawyer/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, [user, navigate]);
  
  return !user ? children : null;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100" style={{ minHeight: "100vh" }}>
      <Routes>
        {/* Public routes that redirect if logged in */}
        <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/login/:role" element={<AuthRoute><Login /></AuthRoute>} />
        
        {/* Protected routes */}
        <Route path="/registrar/dashboard" element={<ProtectedRoute><RegistrarDashboard /></ProtectedRoute>} />
        <Route path="/registrar/query-case" element={<ProtectedRoute><QueryCase /></ProtectedRoute>} />
        <Route path="/registrar/register-case" element={<ProtectedRoute><RegisterCase /></ProtectedRoute>} />
        <Route path="/registrar/update-case/:cin" element={<ProtectedRoute><UpdateCase /></ProtectedRoute>} />
        <Route path="/registrar/create-user" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
        <Route path="/registrar/delete-user" element={<ProtectedRoute><DeleteUser /></ProtectedRoute>} />
        <Route path="/registrar/clear-bills" element={<ProtectedRoute><ClearBillsPage /></ProtectedRoute>} />
        
        {/* Judge routes */}
        <Route path="/judge/dashboard" element={<ProtectedRoute><JudgeDashboard /></ProtectedRoute>} />
        <Route path="/judge/query-case" element={<ProtectedRoute><QueryCase /></ProtectedRoute>} />
        
        {/* Lawyer routes */}
        <Route path="/lawyer/dashboard" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/query-case" element={<ProtectedRoute><QueryCase /></ProtectedRoute>} />
        <Route path="/lawyer/view-bill" element={<ProtectedRoute><ViewBill /></ProtectedRoute>} />
        
        <Route path="/case-summary/:cin" element={<ProtectedRoute><CaseSummaryPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
