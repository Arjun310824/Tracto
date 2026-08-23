import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TractorList from "../pages/TractorList";
import TractorDetails from "../pages/TractorDetails";
import BookTractor from "../pages/BookTractor";
import AIRecommendation from "../pages/AIRecommendation";

import CustomerDashboard from "../pages/CustomerDashboard";
import MyBookings from "../pages/MyBookings";
import Favorites from "../pages/Favorites";
import UserProfile from "../pages/UserProfile";
import NotificationsPage from "../pages/NotificationsPage";

import OwnerDashboard from "../pages/OwnerDashboard";
import MyTractors from "../pages/MyTractors";
import AddTractor from "../pages/AddTractor";
import EditTractor from "../pages/EditTractor";
import OwnerBookings from "../pages/OwnerBookings";
import OwnerEarnings from "../pages/OwnerEarnings";

import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminTractors from "../pages/AdminTractors";
import AdminBookings from "../pages/AdminBookings";
import AdminPayments from "../pages/AdminPayments";
import AdminReviews from "../pages/AdminReviews";
import AdminReports from "../pages/AdminReports";

import InvoiceView from "../pages/InvoiceView";

// Safe Authentication & User Retrieval Helper
const getAuthUser = () => {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");
  if (!token || !userStr || userStr === "null" || userStr === "undefined") {
    return null;
  }
  try {
    const userObj = JSON.parse(userStr);
    return userObj && (userObj.id || userObj.email) ? userObj : null;
  } catch (e) {
    return null;
  }
};

// Strict Protected Route Wrapper with Role Authorization Guard
function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = getAuthUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user role is not authorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "owner") return <Navigate to="/owner-dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/customer-dashboard" replace />;
  }

  return children;
}

// Redirects already logged in users away from /login or /register to their dashboard
function PublicOnlyRoute({ children }) {
  const user = getAuthUser();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "owner") return <Navigate to="/owner-dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/customer-dashboard" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Pages */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Public Browsing Pages: Anyone can view Home and Catalog */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tractors" element={<TractorList />} />
        <Route path="/ai-advisor" element={<AIRecommendation />} />
        <Route path="/tractor/:id" element={<TractorDetails />} />

        {/* Protected Booking: Strictly requires Customer Login */}
        <Route path="/book-tractor/:id" element={<ProtectedRoute allowedRoles={["customer"]}><BookTractor /></ProtectedRoute>} />

        {/* Dashboard Smart Role Redirect */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* Customer / Farmer Protected Pages */}
        <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><MyBookings /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><Favorites /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Owner Protected Pages (Strictly blocked for normal customers) */}
        <Route path="/owner-dashboard" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/my-tractors" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><MyTractors /></ProtectedRoute>} />
        <Route path="/add-tractor" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><AddTractor /></ProtectedRoute>} />
        <Route path="/edit-tractor/:id" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><EditTractor /></ProtectedRoute>} />
        <Route path="/owner-bookings" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerBookings /></ProtectedRoute>} />
        <Route path="/owner-earnings" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerEarnings /></ProtectedRoute>} />

        {/* Admin Protected Pages (Strictly blocked for all non-admins) */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin-tractors" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTractors /></ProtectedRoute>} />
        <Route path="/admin-bookings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin-payments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin-reviews" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReviews /></ProtectedRoute>} />
        <Route path="/admin-reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />

        {/* Invoice (Protected) */}
        <Route path="/invoice/:bookingId" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
