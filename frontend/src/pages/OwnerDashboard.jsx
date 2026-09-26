import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTractor, FaBookmark, FaRupeeSign, FaPlusCircle, FaClock, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

function OwnerDashboard() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

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
      const tList = (tRes.data.results || tRes.data || []).filter(
        (t) => t.owner === user?.id || t.owner_details?.id === user?.id
      );

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
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Responsive Sidebar */}
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            {/* Header with Add Tractor Button */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading">
                  Equipment Owner Hub
                </h1>
                <p className="text-muted small m-0 mt-0.5">
                  Monitor equipment utilization, incoming farmer requests, and rental payouts
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/add-tractor")}
                icon={<FaPlusCircle />}
              >
                Add New Tractor
              </Button>
            </div>

            {/* Key Performance Indicators */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Fleet Machinery"
                  value={stats.myTractorsCount}
                  icon={<FaTractor />}
                  subtext="Tractors listed in catalog"
                  onClick={() => navigate("/my-tractors")}
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Pending Requests"
                  value={stats.pendingRequests}
                  icon={<FaClock />}
                  variant="warning"
                  subtext="Farmers waiting for approval"
                  onClick={() => navigate("/owner-bookings")}
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Active / In Work"
                  value={stats.activeBookings}
                  icon={<FaCheckCircle />}
                  variant="info"
                  subtext="Confirmed or on field"
                  onClick={() => navigate("/owner-bookings")}
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Total Revenue"
                  value={`₹${stats.totalEarnings.toLocaleString()}`}
                  icon={<FaRupeeSign />}
                  variant="success"
                  subtext="Gross earnings generated"
                  onClick={() => navigate("/owner-earnings")}
                />
              </div>
            </div>

            {/* Pending Requests Table */}
            <div className="bg-white rounded-4 border p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-extrabold text-dark m-0 font-heading">Incoming Booking Requests</h5>
                <Link to="/owner-bookings" className="text-success small fw-semibold d-flex align-items-center gap-1 text-decoration-none">
                  <span>View All Requests</span>
                  <FaArrowRight />
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="tracto-spinner" style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }} />
                  <p className="text-muted small mt-2">Loading incoming requests...</p>
                </div>
              ) : recentRequests.length === 0 ? (
                <EmptyState
                  icon={<FaBookmark />}
                  title="No Pending Requests"
                  description="You are caught up! New rental requests from farmers will appear here for your review and approval."
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>REF ID</th>
                        <th>Farmer</th>
                        <th>Machinery</th>
                        <th>Rental Period</th>
                        <th>Total Amount</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-bold small font-monospace">TRC{b.id.toString().padStart(5, "0")}</td>
                          <td>
                            <div className="fw-semibold text-dark">
                              {b.customer_details?.first_name || "Farmer"} {b.customer_details?.last_name || ""}
                            </div>
                            <small className="text-muted">{b.customer_details?.phone || b.customer_details?.email}</small>
                          </td>
                          <td className="fw-semibold">{b.tractor_details?.name}</td>
                          <td className="small text-muted">{b.start_date} to {b.end_date}</td>
                          <td className="fw-bold text-success font-monospace">₹{b.total_amount}</td>
                          <td className="text-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/owner-bookings")}
                            >
                              Review Request
                            </Button>
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