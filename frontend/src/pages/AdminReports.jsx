import { useState, useEffect } from "react";
import { FaChartBar, FaRupeeSign, FaTractor, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaUserCheck } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { RevenueTrendChart, FleetDistributionChart, EngineMeterMetricsChart } from "../components/AnalyticsCharts";

function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("accounts/dashboard-stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats for reports:", err);
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
              <h2 className="fw-extrabold text-dark m-0">📊 Platform Financial Analytics & Growth Reports</h2>
              <p className="text-muted small">Real-time revenue curves, tractor brand market shares, and engine utilization metrics</p>
            </div>

            {/* Interactive Revenue & Dispatch Trend Curve */}
            <RevenueTrendChart data={stats?.monthly_data} title="Platform Gross Revenue & Booking Volume Curve" />

            {/* Fleet Brand & Engine Utilization Row */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <FleetDistributionChart />
              </div>
              <div className="col-lg-6">
                <EngineMeterMetricsChart
                  totalHours={stats?.total_meter_hours || 184.2}
                  activeTrips={stats?.active_bookings || 6}
                  completedTrips={stats?.total_bookings || 19}
                />
              </div>
            </div>


            {/* 4 Analytics Grid Cards */}
            <div className="row g-4 mb-4">
              {/* Most Rented Tractors */}
              <div className="col-md-6">
                <div className="glass-card p-4 h-100">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaTractor className="text-success" /> Most Rented Tractors
                  </h5>
                  <ul className="list-group list-group-flush">
                    {stats?.top_tractors?.length === 0 ? (
                      <li className="list-group-item bg-transparent text-muted small">No tractor data available</li>
                    ) : (
                      stats?.top_tractors?.map((t) => (
                        <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3">
                          <div>
                            <div className="fw-bold text-dark">{t.name}</div>
                            <div className="text-muted small">{t.brand} • ₹{t.rent_per_day}/day</div>
                          </div>
                          <span className="badge bg-success-subtle text-success fs-6 fw-bold px-3 py-1.5 rounded-pill">
                            {t.booking_count} Rentals
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Most Active Owners */}
              <div className="col-md-6">
                <div className="glass-card p-4 h-100">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaUserCheck className="text-primary" /> Most Active Owners
                  </h5>
                  <ul className="list-group list-group-flush">
                    {stats?.top_owners?.length === 0 ? (
                      <li className="list-group-item bg-transparent text-muted small">No owner data available</li>
                    ) : (
                      stats?.top_owners?.map((o) => (
                        <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3">
                          <div>
                            <div className="fw-bold text-dark">{o.first_name} {o.last_name}</div>
                            <div className="text-muted small">{o.email}</div>
                          </div>
                          <span className="badge bg-primary-subtle text-primary fs-6 fw-bold px-3 py-1.5 rounded-pill">
                            {o.tractor_count} Tractors
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Most Active Customers */}
              <div className="col-md-6">
                <div className="glass-card p-4 h-100">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaUsers className="text-warning" /> Most Active Customers
                  </h5>
                  <ul className="list-group list-group-flush">
                    {stats?.top_customers?.length === 0 ? (
                      <li className="list-group-item bg-transparent text-muted small">No customer data available</li>
                    ) : (
                      stats?.top_customers?.map((c) => (
                        <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3">
                          <div>
                            <div className="fw-bold text-dark">{c.first_name || "Customer"} {c.last_name || `#${c.id}`}</div>
                            <div className="text-muted small">{c.email}</div>
                          </div>
                          <span className="badge bg-warning-subtle text-warning fs-6 fw-bold px-3 py-1.5 rounded-pill">
                            {c.booking_count} Bookings
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Popular Locations */}
              <div className="col-md-6">
                <div className="glass-card p-4 h-100">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaMapMarkerAlt className="text-danger" /> Popular Locations / Districts
                  </h5>
                  <ul className="list-group list-group-flush">
                    {stats?.popular_locations?.length === 0 ? (
                      <li className="list-group-item bg-transparent text-muted small">No location data available</li>
                    ) : (
                      stats?.popular_locations?.map((l, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3">
                          <div>
                            <div className="fw-bold text-dark">{l.district || "Ahmedabad"}</div>
                            <div className="text-muted small">District Hub</div>
                          </div>
                          <span className="badge bg-danger-subtle text-danger fs-6 fw-bold px-3 py-1.5 rounded-pill">
                            {l.tractor_count} Tractors Available
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
