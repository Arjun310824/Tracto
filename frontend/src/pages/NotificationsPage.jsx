import { useState, useEffect } from "react";
import { FaBell, FaCheck, FaTrash, FaInfoCircle, FaTractor } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("notifications/");
      setNotifications(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/read-all/");
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-xl-10 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                  <FaBell className="text-success" /> Notifications & Alerts
                </h2>
                <p className="text-muted small">Stay updated on your tractor rental requests, approvals, and payments</p>
              </div>

              <button className="btn btn-outline-success rounded-pill btn-sm fw-bold d-flex align-items-center gap-1.5" onClick={handleMarkAllRead}>
                <FaCheck /> Mark All as Read
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaBell className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Notifications Yet</h5>
                <p className="text-muted small">You will receive notifications when booking requests, approvals, or payments occur.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {notifications.map((n) => (
                  <div key={n.id} className={`glass-card p-3.5 border-start border-4 ${n.is_read ? "border-secondary opacity-75" : "border-success"}`}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                        {!n.is_read && <span className="badge bg-success rounded-circle p-1"> </span>}
                        {n.title}
                      </div>
                      <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-secondary small m-0 ms-3">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
