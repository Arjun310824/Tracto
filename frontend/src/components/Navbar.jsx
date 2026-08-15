import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaTractor, FaHeart, FaBell, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaPlusCircle } from "react-icons/fa";
import api from "../api/axios";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.id, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const countRes = await api.get("notifications/unread-count/");
      setUnreadCount(countRes.data.unread_count || 0);

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
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-tracto sticky-top px-3 py-2 shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
          <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            <FaTractor className="fs-5" />
          </div>
          <span>TRACTO</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <Link className={`nav-link text-light fw-medium ${location.pathname === "/tractors" ? "active text-success fw-bold" : ""}`} to="/tractors">
                Explore Tractors
              </Link>
            </li>
            {user && user.role === "customer" && (
              <li className="nav-item">
                <Link className={`nav-link text-light fw-medium d-flex align-items-center gap-1 ${location.pathname === "/favorites" ? "active text-danger fw-bold" : ""}`} to="/favorites">
                  <FaHeart className="text-danger" /> Wishlist
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                  Login
                </Link>
                <Link to="/register" className="btn btn-success btn-sm px-3 rounded-pill">
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* Role Badge */}
                <span className={`badge rounded-pill text-uppercase px-2.5 py-1.5 ${user.role === "owner" ? "bg-warning text-dark" : user.role === "admin" ? "bg-danger" : "bg-success"}`}>
                  {user.role}
                </span>

                {/* Notifications Bell */}
                <div className="position-relative">
                  <button
                    className="btn btn-dark btn-sm rounded-circle p-2 text-light position-relative border-secondary"
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowUserMenu(false);
                    }}
                    title="Notifications"
                  >
                    <FaBell className="fs-6" />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="position-absolute end-0 mt-2 bg-white text-dark shadow-lg rounded-3 border p-0 z-3" style={{ width: "320px", maxHeight: "400px", overflowY: "auto" }}>
                      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                        <h6 className="mb-0 fw-bold">Notifications</h6>
                        {unreadCount > 0 && (
                          <button className="btn btn-link btn-sm p-0 text-success text-decoration-none" onClick={handleMarkAllRead}>
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="list-group list-group-flush">
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-muted small">No notifications yet.</div>
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

                {/* Quick Dashboard Action */}
                <Link
                  to={user.role === "owner" ? "/owner-dashboard" : user.role === "admin" ? "/admin-dashboard" : "/customer-dashboard"}
                  className="btn btn-sm btn-outline-success text-white border-success rounded-pill d-flex align-items-center gap-1"
                >
                  <FaTachometerAlt /> Dashboard
                </Link>

                {user.role === "owner" && (
                  <Link to="/add-tractor" className="btn btn-sm btn-success rounded-pill d-flex align-items-center gap-1">
                    <FaPlusCircle /> Add Tractor
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="position-relative">
                  <button
                    className="btn btn-dark btn-sm rounded-pill d-flex align-items-center gap-2 border-secondary px-3 py-1.5 text-white"
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
                    <div className="position-absolute end-0 mt-2 bg-white text-dark shadow-lg rounded-3 border py-1 z-3" style={{ minWidth: "180px" }}>
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

                {/* Explicit Red Logout Button */}
                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1 fw-bold"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;