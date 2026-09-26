import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserCheck,
  FaTractor,
  FaBookmark,
  FaRupeeSign,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { RevenueTrendChart } from "../components/AnalyticsCharts";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

function AdminDashboard() {
  const navigate = useNavigate();
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
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
        <Navbar />
        <div className="text-center py-5 my-auto">
          <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
          <p className="text-muted small mt-3">Loading system analytics...</p>
        </div>
      </div>
    );
  }

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
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-danger" /> Admin Command Center
                </h1>
                <p className="text-muted small m-0 mt-0.5">
                  Platform oversight, user verification, equipment approvals, and revenue analytics
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/admin-tractors")}>
                  Tractor Approvals
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate("/admin-users")}>
                  Manage Users
                </Button>
              </div>
            </div>

            {/* Platform Key Metrics Row */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard
                  label="Total Users"
                  value={stats?.total_users || 0}
                  icon={<FaUsers />}
                  variant="default"
                  onClick={() => navigate("/admin-users")}
                />
              </div>

              <div className="col-6 col-md-4 col-xl-2">
                <StatCard
                  label="Owners"
                  value={stats?.total_owners || 0}
                  icon={<FaUserCheck />}
                  variant="warning"
                  onClick={() => navigate("/admin-users")}
                />
              </div>

              <div className="col-6 col-md-4 col-xl-2">
                <StatCard
                  label="Farmers"
                  value={stats?.total_customers || 0}
                  icon={<FaUsers />}
                  variant="info"
                  onClick={() => navigate("/admin-users")}
                />
              </div>

              <div className="col-6 col-md-4 col-xl-2">
                <StatCard
                  label="Fleet Tractors"
                  value={stats?.total_tractors || 0}
                  icon={<FaTractor />}
                  variant="success"
                  onClick={() => navigate("/admin-tractors")}
                />
              </div>

              <div className="col-6 col-md-4 col-xl-2">
                <StatCard
                  label="Total Bookings"
                  value={stats?.total_bookings || 0}
                  icon={<FaBookmark />}
                  variant="default"
                  onClick={() => navigate("/admin-bookings")}
                />
              </div>

              <div className="col-6 col-md-4 col-xl-2">
                <StatCard
                  label="Gross Revenue"
                  value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
                  icon={<FaRupeeSign />}
                  variant="accent"
                  onClick={() => navigate("/admin-payments")}
                />
              </div>
            </div>

            {/* Interactive Revenue & Growth Graph */}
            <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
              <RevenueTrendChart
                data={stats?.monthly_data}
                title="Monthly Platform Revenue & Tractor Booking Velocity"
              />
            </div>

            {/* Top Tractors & Active Owners */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-lg-6">
                <div className="bg-white rounded-4 border p-4 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">Top Rented Tractors</h5>
                    <Link to="/admin-tractors" className="text-success small fw-semibold text-decoration-none">
                      View All
                    </Link>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tractor</th>
                          <th>Brand</th>
                          <th>Rent / Day</th>
                          <th className="text-end">Bookings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.top_tractors?.map((t) => (
                          <tr key={t.id}>
                            <td className="fw-semibold text-dark">{t.name}</td>
                            <td><Badge variant="primary" size="sm">{t.brand}</Badge></td>
                            <td className="text-success fw-bold font-monospace">₹{t.rent_per_day}</td>
                            <td className="text-end">
                              <Badge variant="success" size="sm">{t.booking_count} times</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="bg-white rounded-4 border p-4 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">Top Active Owners</h5>
                    <Link to="/admin-users" className="text-success small fw-semibold text-decoration-none">
                      View Users
                    </Link>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Owner Name</th>
                          <th>Contact</th>
                          <th className="text-end">Tractors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.top_owners?.map((o) => (
                          <tr key={o.id}>
                            <td className="fw-semibold text-dark">
                              {o.first_name} {o.last_name}
                            </td>
                            <td className="small text-muted">{o.phone || o.email}</td>
                            <td className="text-end">
                              <Badge variant="info" size="sm">{o.tractor_count} Tractors</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Action Strip */}
            <div className="d-flex flex-wrap gap-2.5">
              <Button variant="outline" onClick={() => navigate("/admin-users")}>
                Manage All Users
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin-tractors")}>
                Tractor Approvals
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin-bookings")}>
                All Bookings
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin-payments")}>
                Payments & Disputes
              </Button>
              <Button variant="primary" onClick={() => navigate("/admin-reports")}>
                Platform Financial Reports & Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
