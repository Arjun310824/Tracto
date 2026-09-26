import { useState, useEffect } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Responsive Sidebar for Mobile & Desktop */}
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading d-flex align-items-center gap-2">
                  <FaBell className="text-success" /> Notifications & Alerts
                </h1>
                <p className="text-muted small m-0 mt-0.5">
                  Stay updated on your equipment booking requests, approvals, and dispatch alerts
                </p>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  icon={<FaCheck />}
                >
                  Mark All as Read ({unreadCount})
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
                <p className="text-muted small mt-3">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 shadow-sm my-2">
                <EmptyState
                  icon={<FaBell />}
                  title="No Notifications Yet"
                  description="You will receive alerts here when booking requests, owner approvals, or trip dispatches happen."
                />
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-3 border transition-all ${
                      n.is_read
                        ? "bg-white border-light-subtle opacity-80"
                        : "bg-success-subtle border-success shadow-sm"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                      <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                        {!n.is_read && <span className="tracto-badge-dot bg-success" />}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-muted small text-nowrap" style={{ fontSize: "0.75rem" }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-secondary small m-0 mt-1">{n.message}</p>
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
