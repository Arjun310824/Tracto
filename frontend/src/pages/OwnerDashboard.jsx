import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTractor, FaBookmark, FaRupeeSign, FaPlusCircle, FaClock, FaCheckCircle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function OwnerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [stats, setStats] = useState({
    myTractorsCount: 0,
    pendingRequests: 0,
    activeBookings: 0,
    totalEarnings: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerStats();
  }, []);

  const fetchOwnerStats = async () => {
    try {
      const tRes = await api.get("tractors/");
      const tList = (tRes.data.results || tRes.data || []).filter((t) => t.owner === user?.id || t.owner_details?.id === user?.id);

      const bRes = await api.get("bookings/");
      const bList = bRes.data.results || bRes.data || [];

      const pending = bList.filter((b) => b.status === "pending");
      const paidComp = bList.filter((b) => b.status === "paid" || b.status === "completed");

      const earnings = paidComp.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

      setRecentRequests(pending.slice(0, 5));
      setStats({
        myTractorsCount: tList.length,
        pendingRequests: pending.length,
        activeBookings: bList.filter((b) => b.status === "approved" || b.status === "paid").length,
        totalEarnings: earnings,
      });
    } catch (err) {
      console.error("Error fetching owner stats:", err);
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-extrabold text-dark m-0">Owner Dashboard</h2>
                <p className="text-muted small">Manage your fleet, approve bookings, and track rental earnings</p>
              </div>
              <Link to="/add-tractor" className="btn btn-tracto-primary rounded-pill px-4 btn-sm d-flex align-items-center gap-1.5">
                <FaPlusCircle /> Add New Tractor
              </Link>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-success-subtle text-success p-3 rounded-circle fs-4">
                    <FaTractor />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.myTractorsCount}</div>
                    <div className="text-muted small">Listed Tractors</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning p-3 rounded-circle fs-4">
                    <FaClock />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.pendingRequests}</div>
                    <div className="text-muted small">Pending Requests</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary p-3 rounded-circle fs-4">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{stats.activeBookings}</div>
                    <div className="text-muted small">Active / Approved</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3.5 d-flex align-items-center gap-3">
                  <div className="bg-emerald-subtle text-emerald p-3 rounded-circle fs-4 text-success">
                    <FaRupeeSign />
                  </div>
                  <div>
                    <div className="fs-3 fw-extrabold text-success">₹{stats.totalEarnings}</div>
                    <div className="text-muted small">Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Requests Table */}
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark m-0">Pending Booking Requests</h5>
                <Link to="/owner-bookings" className="btn btn-link btn-sm text-success p-0 fw-semibold text-decoration-none">
                  View All Requests
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-success" role="status"></div>
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="text-center py-4 text-muted small">No pending booking requests right now.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>REF ID</th>
                        <th>Customer</th>
                        <th>Tractor</th>
                        <th>Rental Period</th>
                        <th>Total Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-bold small">TRC{b.id.toString().padStart(5, "0")}</td>
                          <td className="small">{b.customer_details?.first_name || b.customer_details?.email}</td>
                          <td className="fw-semibold">{b.tractor_details?.name}</td>
                          <td className="small">{b.start_date} to {b.end_date}</td>
                          <td className="fw-bold text-success">₹{b.total_amount}</td>
                          <td>
                            <Link to="/owner-bookings" className="btn btn-outline-success btn-sm rounded-pill">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;