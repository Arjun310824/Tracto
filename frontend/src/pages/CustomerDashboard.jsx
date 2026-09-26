import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBookmark, FaHeart, FaTractor, FaSearch, FaCheckCircle, FaClock, FaArrowRight } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [stats, setStats] = useState({
    totalBookings: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    wishlistCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const bRes = await api.get("bookings/");
      const bList = bRes.data.results || bRes.data || [];

      const wRes = await api.get("wishlist/");
      const wList = wRes.data.results || wRes.data || [];

      setRecentBookings(bList.slice(0, 5));
      setStats({
        totalBookings: bList.length,
        pending: bList.filter((b) => b.status === "pending").length,
        approved: bList.filter((b) => b.status === "approved").length,
        completed: bList.filter((b) => b.status === "completed" || b.status === "paid").length,
        wishlistCount: wList.length,
      });
    } catch (err) {
      console.error("Error fetching customer stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Responsive Sidebar for Mobile Bar & Desktop Sidebar */}
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            {/* Header Greeting */}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading">
                  Welcome back, {user?.first_name || "Farmer"}! 👋
                </h1>
                <p className="text-muted small m-0 mt-0.5">
                  Manage your machinery rentals, track active requests, and explore tractors near you
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/tractors")}
                icon={<FaSearch />}
              >
                Explore Machinery
              </Button>
            </div>

            {/* High-Impact Key Metrics Row */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Total Bookings"
                  value={stats.totalBookings}
                  icon={<FaBookmark />}
                  subtext="Lifetime rental orders"
                  onClick={() => navigate("/my-bookings")}
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Pending Approval"
                  value={stats.pending}
                  icon={<FaClock />}
                  variant="warning"
                  subtext="Awaiting owner confirmation"
                  onClick={() => navigate("/my-bookings")}
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Active / Completed"
                  value={stats.completed}
                  icon={<FaCheckCircle />}
                  variant="success"
                  subtext="Paid or finished on field"
                  onClick={() => navigate("/my-bookings")}
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Wishlist Saved"
                  value={stats.wishlistCount}
                  icon={<FaHeart />}
                  variant="danger"
                  subtext="Saved for fast hire"
                  onClick={() => navigate("/favorites")}
                />
              </div>
            </div>

            {/* Recent Bookings & Search CTA Row */}
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="bg-white rounded-4 border p-4 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">Recent Booking Requests</h5>
                    <Link to="/my-bookings" className="text-success small fw-semibold d-flex align-items-center gap-1 text-decoration-none">
                      <span>View All Bookings</span>
                      <FaArrowRight />
                    </Link>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="tracto-spinner" style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }} />
                      <p className="text-muted small mt-2">Loading recent bookings...</p>
                    </div>
                  ) : recentBookings.length === 0 ? (
                    <EmptyState
                      icon={<FaBookmark />}
                      title="No Bookings Yet"
                      description="You haven't requested any tractors or machinery yet. Search our verified fleet and hire equipment for your farm."
                      action={
                        <Button variant="primary" size="sm" onClick={() => navigate("/tractors")} icon={<FaSearch />}>
                          Find Tractors
                        </Button>
                      }
                    />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>REF ID</th>
                            <th>Machinery</th>
                            <th>Rental Dates</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((b) => (
                            <tr key={b.id} onClick={() => navigate("/my-bookings")} style={{ cursor: "pointer" }}>
                              <td className="fw-bold small font-monospace">TRC{b.id.toString().padStart(5, "0")}</td>
                              <td>
                                <div className="fw-semibold text-dark">{b.tractor_details?.name || "Tractor"}</div>
                                <small className="text-muted">{b.tractor_details?.brand}</small>
                              </td>
                              <td className="small text-muted">
                                {b.start_date} to {b.end_date}
                              </td>
                              <td className="fw-bold text-success font-monospace">₹{b.total_amount}</td>
                              <td>
                                <Badge variant={b.status} size="sm">
                                  {b.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Find Machinery Banner */}
              <div className="col-12 col-lg-4">
                <div className="bg-white rounded-4 border p-4 text-center shadow-sm h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="p-3.5 rounded-circle d-inline-flex mb-3 shadow-sm"
                      style={{ background: "var(--primary-50)", color: "var(--primary-600)" }}
                    >
                      <FaTractor className="fs-2" />
                    </div>
                    <h5 className="fw-extrabold text-dark mb-2 font-heading">Need Equipment for This Season?</h5>
                    <p className="text-muted small mb-4 leading-relaxed">
                      Hire high horsepower Mahindra, Swaraj, and John Deere tractors with rotavators and seeders near your village.
                    </p>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-auto">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => navigate("/tractors")}
                      icon={<FaSearch />}
                    >
                      Search Tractors Near Me
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => navigate("/ai-advisor")}
                    >
                      🤖 Ask AI Advisor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
