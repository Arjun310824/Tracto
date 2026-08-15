import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBookmark, FaHeart, FaTractor, FaSearch, FaCheckCircle, FaClock } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

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
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-xl-10 p-4">
            <div className="mb-4">
              <h2 className="fw-extrabold text-dark m-0">Welcome back, {user?.first_name || "Customer"}! 👋</h2>
              <p className="text-muted small">Manage your tractor rentals, track requests, and explore equipment</p>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-success-subtle text-success p-3 rounded-circle fs-4">
                    <FaBookmark />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.totalBookings}</div>
                    <div className="text-muted small">Total Bookings</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning p-3 rounded-circle fs-4">
                    <FaClock />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.pending}</div>
                    <div className="text-muted small">Pending Approval</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary p-3 rounded-circle fs-4">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.completed}</div>
                    <div className="text-muted small">Active / Completed</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-danger-subtle text-danger p-3 rounded-circle fs-4">
                    <FaHeart />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.wishlistCount}</div>
                    <div className="text-muted small">Wishlist Saved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Banner & Recent Activity */}
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="glass-card p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark m-0">Recent Booking Requests</h5>
                    <Link to="/my-bookings" className="btn btn-link btn-sm text-success p-0 fw-semibold text-decoration-none">
                      View All
                    </Link>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success" role="status"></div>
                    </div>
                  ) : recentBookings.length === 0 ? (
                    <div className="text-center py-4 text-muted small">No recent bookings found.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>REF ID</th>
                            <th>Tractor</th>
                            <th>Rental Dates</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((b) => (
                            <tr key={b.id}>
                              <td className="fw-bold small">TRC{b.id.toString().padStart(5, "0")}</td>
                              <td>{b.tractor_details?.name || "Tractor"}</td>
                              <td className="small">{b.start_date} to {b.end_date}</td>
                              <td className="fw-bold text-success">₹{b.total_amount}</td>
                              <td>
                                <span className={`badge rounded-pill text-uppercase ${b.status === 'completed' || b.status === 'paid' ? 'bg-success' : b.status === 'approved' ? 'bg-primary' : b.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="glass-card p-4 text-center">
                  <div className="bg-success text-white p-3 rounded-circle d-inline-flex mb-3">
                    <FaSearch className="fs-3" />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Need a Tractor for Farm Work?</h5>
                  <p className="text-muted small mb-4">Search high power Mahindra, Swaraj, and John Deere tractors near your village.</p>
                  <Link to="/tractors" className="btn btn-tracto-primary w-100 rounded-pill fw-bold">
                    Find Tractors Near Me
                  </Link>
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
