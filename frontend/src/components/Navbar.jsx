import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTractor,
  FaHeart,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaRobot,
  FaGlobe,
  FaVolumeUp,
  FaBars,
  FaTimes,
  FaCompass,
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { playIncomingRideAlert, playNotificationChime } from "../utils/audioAlert";
import api from "../api/axios";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  const user = (() => {
    try {
      const u = localStorage.getItem("user");
      if (!u || u === "null" || u === "undefined") return null;
      const parsed = JSON.parse(u);
      return parsed && (parsed.id || parsed.email) ? parsed : null;
    } catch {
      return null;
    }
  })();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prevCountRef = useRef(0);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifMenu(false);
    setShowUserMenu(false);
    setShowLangMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async (isPolling = false) => {
    try {
      const countRes = await api.get("notifications/unread-count/");
      const newCount = countRes.data.unread_count || 0;

      if (isPolling && newCount > prevCountRef.current) {
        if (user?.role === "owner") {
          playIncomingRideAlert();
        } else {
          playNotificationChime();
        }
      }
      prevCountRef.current = newCount;
      setUnreadCount(newCount);

      const listRes = await api.get("notifications/");
      setNotifications(listRes.data.results || listRes.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/read-all/");
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-tracto sticky-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Brand Logo & Title */}
        <Link className="navbar-tracto-brand" to="/">
          <div className="navbar-tracto-brand-badge">
            <FaTractor className="fs-5" />
          </div>
          <span>{t("brand")}</span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          {/* Language selector icon for mobile */}
          <button
            className="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setShowLangMenu(!showLangMenu)}
            aria-label="Change language"
          >
            <FaGlobe className="text-warning" />
          </button>

          {user && (
            <button
              className="btn btn-outline-light btn-sm rounded-circle p-2 position-relative"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            className="btn btn-outline-light btn-sm rounded-lg p-2"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes className="fs-5" /> : <FaBars className="fs-5" />}
          </button>
        </div>

        {/* Navigation Content (Desktop & Collapsible Mobile) */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show d-block mt-3 mt-lg-0" : ""}`} id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1 gap-lg-2">
            {(!user || user.role === "customer") && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link text-light fw-medium d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
                      location.pathname === "/tractors" ? "active bg-success text-white fw-bold" : ""
                    }`}
                    to="/tractors"
                  >
                    <FaCompass />
                    <span>{t("exploreTractors")}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link text-warning fw-bold d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
                      location.pathname === "/ai-advisor" ? "active bg-warning-subtle text-warning-emphasis" : ""
                    }`}
                    to="/ai-advisor"
                  >
                    <FaRobot />
                    <span>{t("aiAdvisor")}</span>
                  </Link>
                </li>
                {user && user.role === "customer" && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-light fw-medium d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
                        location.pathname === "/favorites" ? "active bg-danger-subtle text-danger fw-bold" : ""
                      }`}
                      to="/favorites"
                    >
                      <FaHeart className="text-danger" />
                      <span>{t("wishlist")}</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2.5 pt-2 pt-lg-0 border-top border-lg-0 border-white border-opacity-10">
            {/* Language Selector Dropdown */}
            <div className="position-relative w-100 w-lg-auto">
              <button
                className="btn btn-outline-light btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-1.5 fw-bold w-100 justify-content-center"
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
              >
                <FaGlobe className="text-warning" />
                <span>{lang === "gu" ? "🌾 ગુજરાતી" : lang === "hi" ? "🇮🇳 हिन्दी" : "🌐 English"}</span>
              </button>
              {showLangMenu && (
                <ul className="position-absolute end-0 mt-2 bg-white text-dark shadow-lg rounded-3 border p-1 list-unstyled z-3 w-100" style={{ minWidth: 170 }}>
                  <li>
                    <button
                      className={`dropdown-item d-flex align-items-center gap-2 small py-2 px-3 rounded-2 w-100 border-0 bg-transparent text-start ${lang === "gu" ? "fw-bold bg-success-subtle text-success" : "text-dark"}`}
                      onClick={() => {
                        setLang("gu");
                        setShowLangMenu(false);
                      }}
                    >
                      🌾 ગુજરાતી (Gujarati)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex align-items-center gap-2 small py-2 px-3 rounded-2 w-100 border-0 bg-transparent text-start ${lang === "hi" ? "fw-bold bg-success-subtle text-success" : "text-dark"}`}
                      onClick={() => {
                        setLang("hi");
                        setShowLangMenu(false);
                      }}
                    >
                      🇮🇳 हिन्दी (Hindi)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex align-items-center gap-2 small py-2 px-3 rounded-2 w-100 border-0 bg-transparent text-start ${lang === "en" ? "fw-bold bg-success-subtle text-success" : "text-dark"}`}
                      onClick={() => {
                        setLang("en");
                        setShowLangMenu(false);
                      }}
                    >
                      🌐 English
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {!user ? (
              <div className="d-flex align-items-center gap-2 w-100 w-lg-auto">
                <Link to="/login" className="btn btn-outline-success btn-sm rounded-pill px-3.5 py-1.5 fw-bold text-white border-success flex-grow-1 flex-lg-grow-0 text-center">
                  Login
                </Link>
                <Link to="/register" className="btn btn-tracto-primary btn-sm rounded-pill px-3.5 py-1.5 fw-bold flex-grow-1 flex-lg-grow-0 text-center">
                  Register
                </Link>
              </div>
            ) : (
              <>
                {/* Role Badge */}
                <Badge
                  variant={user.role === "owner" ? "warning" : user.role === "admin" ? "danger" : "success"}
                  size="md"
                >
                  {user.role}
                </Badge>

                {/* Notifications Bell for Desktop */}
                <div className="position-relative d-none d-lg-block">
                  <button
                    className="btn btn-dark btn-sm rounded-circle p-2 text-light position-relative border-secondary"
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowUserMenu(false);
                    }}
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <FaBell className="fs-6" />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="position-absolute end-0 mt-2 bg-white text-dark shadow-xl rounded-3 border p-0 z-3" style={{ width: "340px", maxHeight: "420px", overflowY: "auto" }}>
                      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="mb-0 fw-bold">Notifications</h6>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm p-1 rounded-circle border-0"
                            onClick={() => (user?.role === "owner" ? playIncomingRideAlert() : playNotificationChime())}
                            title="🔊 Test Sound Alert"
                          >
                            <FaVolumeUp className="text-success fs-6" />
                          </button>
                        </div>
                        {unreadCount > 0 && (
                          <button className="btn btn-link btn-sm p-0 text-success text-decoration-none fw-semibold" onClick={handleMarkAllRead}>
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="list-group list-group-flush">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted small">No notifications yet.</div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className={`list-group-item p-3 ${!notif.is_read ? "bg-light font-weight-bold" : ""}`}>
                              <div className="fw-semibold small">{notif.title}</div>
                              <div className="text-secondary small mt-1">{notif.message}</div>
                              <div className="text-muted text-end mt-1" style={{ fontSize: "0.7rem" }}>
                                {new Date(notif.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link & Logout */}
                <div className="position-relative w-100 w-lg-auto">
                  <button
                    className="btn btn-dark btn-sm rounded-pill d-flex align-items-center justify-content-center gap-2 border-secondary px-3 py-1.5 text-white w-100 w-lg-auto"
                    type="button"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifMenu(false);
                    }}
                  >
                    <FaUserCircle className="fs-5 text-success" />
                    <span className="small fw-semibold">{user.first_name || user.email.split("@")[0]}</span>
                  </button>

                  {showUserMenu && (
                    <div className="position-absolute end-0 mt-2 bg-white text-dark shadow-xl rounded-3 border py-1 z-3 w-100 w-lg-auto" style={{ minWidth: "180px" }}>
                      <Link
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none"
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUserCircle className="text-success" /> My Profile
                      </Link>
                      <hr className="dropdown-divider my-1" />
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger border-0 bg-transparent w-100 text-start"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-100 w-lg-auto border-danger text-danger"
                  onClick={handleLogout}
                  icon={<FaSignOutAlt />}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;