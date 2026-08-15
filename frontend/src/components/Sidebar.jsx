import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaTractor, FaBookmark, FaHeart, FaPlusCircle, FaUsers, FaChartBar, FaUserCheck, FaSignOutAlt, FaBell, FaCreditCard, FaCommentDots, FaRupeeSign } from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar-tracto p-3 d-flex flex-column" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="px-2 py-3 mb-2 border-bottom">
        <div className="fw-bold text-dark fs-6">{user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email}</div>
        <div className="small text-muted text-capitalize">{user.role} Account</div>
      </div>

      <nav className="nav flex-column mb-auto">
        {/* Customer Menu */}
        {user.role === "customer" && (
          <>
            <Link to="/customer-dashboard" className={`sidebar-link ${isActive("/customer-dashboard") ? "active" : ""}`}>
              <FaTachometerAlt /> Dashboard
            </Link>
            <Link to="/my-bookings" className={`sidebar-link ${isActive("/my-bookings") ? "active" : ""}`}>
              <FaBookmark /> My Bookings
            </Link>
            <Link to="/favorites" className={`sidebar-link ${isActive("/favorites") ? "active" : ""}`}>
              <FaHeart /> Favorites
            </Link>
            <Link to="/notifications" className={`sidebar-link ${isActive("/notifications") ? "active" : ""}`}>
              <FaBell /> Notifications
            </Link>
            <Link to="/profile" className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}>
              <FaUserCheck /> My Profile
            </Link>
          </>
        )}

        {/* Owner Menu */}
        {user.role === "owner" && (
          <>
            <Link to="/owner-dashboard" className={`sidebar-link ${isActive("/owner-dashboard") ? "active" : ""}`}>
              <FaTachometerAlt /> Dashboard
            </Link>
            <Link to="/my-tractors" className={`sidebar-link ${isActive("/my-tractors") ? "active" : ""}`}>
              <FaTractor /> My Tractors
            </Link>
            <Link to="/add-tractor" className={`sidebar-link ${isActive("/add-tractor") ? "active" : ""}`}>
              <FaPlusCircle /> Add Tractor
            </Link>
            <Link to="/owner-bookings" className={`sidebar-link ${isActive("/owner-bookings") ? "active" : ""}`}>
              <FaBookmark /> Booking Requests
            </Link>
            <Link to="/owner-earnings" className={`sidebar-link ${isActive("/owner-earnings") ? "active" : ""}`}>
              <FaRupeeSign /> Earnings
            </Link>
            <Link to="/profile" className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}>
              <FaUserCheck /> My Profile
            </Link>
          </>
        )}

        {/* Admin Menu */}
        {user.role === "admin" && (
          <>
            <Link to="/admin-dashboard" className={`sidebar-link ${isActive("/admin-dashboard") ? "active" : ""}`}>
              <FaTachometerAlt /> Admin Dashboard
            </Link>
            <Link to="/admin-users" className={`sidebar-link ${isActive("/admin-users") ? "active" : ""}`}>
              <FaUsers /> User Management
            </Link>
            <Link to="/admin-tractors" className={`sidebar-link ${isActive("/admin-tractors") ? "active" : ""}`}>
              <FaTractor /> Tractor Approvals
            </Link>
            <Link to="/admin-bookings" className={`sidebar-link ${isActive("/admin-bookings") ? "active" : ""}`}>
              <FaBookmark /> Bookings
            </Link>
            <Link to="/admin-payments" className={`sidebar-link ${isActive("/admin-payments") ? "active" : ""}`}>
              <FaCreditCard /> Payments
            </Link>
            <Link to="/admin-reviews" className={`sidebar-link ${isActive("/admin-reviews") ? "active" : ""}`}>
              <FaCommentDots /> Reviews
            </Link>
            <Link to="/admin-reports" className={`sidebar-link ${isActive("/admin-reports") ? "active" : ""}`}>
              <FaChartBar /> Reports
            </Link>
            <Link to="/profile" className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}>
              <FaUserCheck /> Admin Profile
            </Link>
          </>
        )}
      </nav>

      <div className="pt-3 border-top mt-3">
        <button
          className="btn btn-outline-danger w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;