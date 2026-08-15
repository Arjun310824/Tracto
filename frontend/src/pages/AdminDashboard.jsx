import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaUserCheck, FaTractor, FaBookmark, FaRupeeSign, FaChartBar, FaShieldAlt, FaBan, FaCheckCircle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get("accounts/dashboard-stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      </div>
    );
  }

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
              <h2 className="fw-extrabold text-dark m-0">Admin Overview & System Stats</h2>
              <p className="text-muted small">Monitor platform performance, user registrations, and tractor listings</p>
            </div>

            {/* KPI Overview Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4 col-xl-2">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary p-2.5 rounded-circle fs-5">
                    <FaUsers />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">{stats?.total_users || 0}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Total Users</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-xl-2">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning p-2.5 rounded-circle fs-5">
                    <FaUserCheck />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">{stats?.total_owners || 0}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Registered Owners</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-xl-2">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-info-subtle text-info p-2.5 rounded-circle fs-5">
                    <FaUsers />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">{stats?.total_customers || 0}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Customers</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-xl-2">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-success-subtle text-success p-2.5 rounded-circle fs-5">
                    <FaTractor />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">{stats?.total_tractors || 0}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Total Tractors</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-xl-2">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-secondary-subtle text-secondary p-2.5 rounded-circle fs-5">
                    <FaBookmark />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">{stats?.total_bookings || 0}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Bookings Count</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-xl-2">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-emerald-subtle text-emerald p-2.5 rounded-circle fs-5 text-success">
                    <FaRupeeSign />
                  </div>
                  <div>
                    <div className="fs-4 fw-extrabold text-success">₹{stats?.total_revenue || 0}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tables Grid */}
            <div className="row g-4 mb-4">
              {/* Top Rented Tractors */}
              <div className="col-lg-6">
                <div className="glass-card p-4">
                  <h5 className="fw-bold text-dark mb-3">Top Rented Tractors</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tractor</th>
                          <th>Brand</th>
                          <th>Rent / Day</th>
                          <th>Bookings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.top_tractors?.map((t) => (
                          <tr key={t.id}>
                            <td className="fw-semibold text-dark">{t.name}</td>
                            <td>{t.brand}</td>
                            <td className="text-success fw-bold">₹{t.rent_per_day}</td>
                            <td><span className="badge bg-success">{t.booking_count} times</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Active Owners */}
              <div className="col-lg-6">
                <div className="glass-card p-4">
                  <h5 className="fw-bold text-dark mb-3">Top Active Owners</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Owner Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Tractors Listed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.top_owners?.map((o) => (
                          <tr key={o.id}>
                            <td className="fw-semibold text-dark">{o.first_name} {o.last_name}</td>
                            <td className="small">{o.email}</td>
                            <td className="small">{o.phone || 'N/A'}</td>
                            <td><span className="badge bg-primary">{o.tractor_count} Tractors</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="d-flex flex-wrap gap-3">
              <Link to="/admin-users" className="btn btn-outline-primary rounded-pill px-4">
                Manage All Users
              </Link>
              <Link to="/admin-tractors" className="btn btn-outline-success rounded-pill px-4">
                Approve / Reject Tractor Listings
              </Link>
              <Link to="/admin-reports" className="btn btn-outline-warning text-dark rounded-pill px-4 fw-bold">
                View Detailed Analytics & Revenue Charts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
