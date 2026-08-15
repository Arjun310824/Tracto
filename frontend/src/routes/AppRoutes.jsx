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

// Strict Protected Route Wrapper: Redirects any unauthenticated user directly to /login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Redirects logged in users away from /login or /register to their dashboard
function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "owner") return <Navigate to="/owner-dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/customer-dashboard" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Only /login and /register are accessible without authentication */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* All other routes strictly require authentication; otherwise auto-redirect to /login */}
        <Route path="/" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/tractors" element={<ProtectedRoute><TractorList /></ProtectedRoute>} />
        <Route path="/ai-advisor" element={<ProtectedRoute><AIRecommendation /></ProtectedRoute>} />
        <Route path="/tractor/:id" element={<ProtectedRoute><TractorDetails /></ProtectedRoute>} />

        <Route path="/book-tractor/:id" element={<ProtectedRoute><BookTractor /></ProtectedRoute>} />

        {/* Dashboard Smart Redirect */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* Customer Dashboard Pages */}
        <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Owner Dashboard Pages */}
        <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/my-tractors" element={<ProtectedRoute><MyTractors /></ProtectedRoute>} />
        <Route path="/add-tractor" element={<ProtectedRoute><AddTractor /></ProtectedRoute>} />
        <Route path="/edit-tractor/:id" element={<ProtectedRoute><EditTractor /></ProtectedRoute>} />
        <Route path="/owner-bookings" element={<ProtectedRoute><OwnerBookings /></ProtectedRoute>} />
        <Route path="/owner-earnings" element={<ProtectedRoute><OwnerEarnings /></ProtectedRoute>} />


        {/* Admin Dashboard Pages */}
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin-tractors" element={<ProtectedRoute><AdminTractors /></ProtectedRoute>} />
        <Route path="/admin-bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin-payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin-reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
        <Route path="/admin-reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />

        {/* Invoice */}
        <Route path="/invoice/:bookingId" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />

        {/* Catch-all fallback redirects to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
