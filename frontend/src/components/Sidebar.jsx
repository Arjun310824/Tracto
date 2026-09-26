import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTractor,
  FaBookmark,
  FaHeart,
  FaPlusCircle,
  FaUsers,
  FaChartBar,
  FaUserCheck,
  FaSignOutAlt,
  FaBell,
  FaCreditCard,
  FaCommentDots,
  FaRupeeSign,
  FaBars,
  FaTimes,
  FaShieldAlt,
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { Badge } from "./ui/Badge";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    // Customer Menu
    ...(user.role === "customer"
      ? [
          { to: "/customer-dashboard", label: t("dashboard") || "Dashboard", icon: <FaTachometerAlt /> },
          { to: "/my-bookings", label: t("myBookings") || "My Bookings", icon: <FaBookmark /> },
          { to: "/favorites", label: t("wishlist") || "Wishlist", icon: <FaHeart /> },
          { to: "/notifications", label: t("notifications") || "Notifications", icon: <FaBell /> },
          { to: "/profile", label: t("myProfile") || "My Profile", icon: <FaUserCheck /> },
        ]
      : []),

    // Owner Menu
    ...(user.role === "owner"
      ? [
          { to: "/owner-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
          { to: "/my-tractors", label: "My Tractors", icon: <FaTractor /> },
          { to: "/add-tractor", label: "Add Tractor", icon: <FaPlusCircle /> },
          { to: "/owner-bookings", label: "Booking Requests", icon: <FaBookmark /> },
          { to: "/owner-earnings", label: "Earnings", icon: <FaRupeeSign /> },
          { to: "/profile", label: "My Profile", icon: <FaUserCheck /> },
        ]
      : []),

    // Admin Menu
    ...(user.role === "admin"
      ? [
          { to: "/admin-dashboard", label: "Admin Dashboard", icon: <FaTachometerAlt /> },
          { to: "/admin-users", label: "User Management", icon: <FaUsers /> },
          { to: "/admin-tractors", label: "Tractor Approvals", icon: <FaTractor /> },
          { to: "/admin-bookings", label: "Bookings", icon: <FaBookmark /> },
          { to: "/admin-payments", label: "Payments", icon: <FaCreditCard /> },
          { to: "/admin-reviews", label: "Reviews", icon: <FaCommentDots /> },
          { to: "/admin-reports", label: "Reports", icon: <FaChartBar /> },
          { to: "/profile", label: "Admin Profile", icon: <FaUserCheck /> },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Dashboard Bar (Visible only on mobile screens < lg) */}
      <div className="d-lg-none w-100 bg-white border-bottom px-3 py-2.5 shadow-sm">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="fw-bold text-dark small text-truncate" style={{ maxWidth: 180 }}>
              {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.email}
            </div>
            <Badge variant={user.role === "owner" ? "warning" : user.role === "admin" ? "danger" : "success"} size="sm">
              {user.role}
            </Badge>
          </div>
          <button
            type="button"
            className="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 fw-bold"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            aria-expanded={mobileExpanded}
          >
            {mobileExpanded ? <FaTimes /> : <FaBars />}
            <span>Menu</span>
          </button>
        </div>

        {mobileExpanded && (
          <div className="pt-3 pb-1 border-top mt-2">
            <nav className="d-flex flex-column gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
                  onClick={() => setMobileExpanded(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill mt-2 d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar (Default view for >= lg screens) */}
      <div className="sidebar-tracto d-none d-lg-flex">
        {/* User Profile Card Header */}
        <div className="p-3 mb-3 bg-light rounded-3 border">
          <div className="fw-bold text-dark fs-6 text-truncate">
            {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.email}
          </div>
          <div className="d-flex align-items-center justify-content-between mt-1">
            <Badge variant={user.role === "owner" ? "warning" : user.role === "admin" ? "danger" : "success"} size="sm">
              {user.role} Account
            </Badge>
            {user.role === "admin" && <FaShieldAlt className="text-danger small" />}
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="nav flex-column mb-auto gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Logout Button */}
        <div className="pt-3 border-top mt-3">
          <button
            type="button"
            className="btn btn-outline-danger w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold py-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;