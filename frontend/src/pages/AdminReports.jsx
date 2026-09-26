import { useState, useEffect } from "react";
import {
  FaChartBar,
  FaRupeeSign,
  FaTractor,
  FaCalendarAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaUserCheck,
  FaTachometerAlt,
  FaArrowUp,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  RevenueTrendChart,
  FleetDistributionChart,
  EngineMeterMetricsChart,
} from "../components/AnalyticsCharts";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

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
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
        <Navbar />
        <div className="text-center py-5 my-auto">
          <div
            className="tracto-spinner"
            style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }}
          />
          <p className="text-muted small mt-3">Compiling platform growth metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            {/* Header */}
            <div className="mb-4">
              <h1 className="h3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <FaChartBar style={{ color: "var(--primary-600)" }} /> Analytics & Growth Reports
              </h1>
              <p className="text-secondary small mb-0">
                Real-time platform revenue curve, tractor brand market shares, and engine utilization telemetry.
              </p>
            </div>

            {/* KPI Stat Cards */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="Platform Revenue"
                  value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
                  icon={<FaRupeeSign />}
                  trend={{ direction: "up", label: "+18% vs last month" }}
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="Total Dispatches"
                  value={stats?.total_bookings || 0}
                  icon={<FaCalendarAlt />}
                  trend={{ direction: "up", label: "Active platform volume" }}
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="Active Fleet"
                  value={stats?.total_tractors || 0}
                  icon={<FaTractor />}
                  trend={{ direction: "neutral", label: "Listed across regions" }}
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="Meter Hours Logged"
                  value={`${stats?.total_meter_hours || 184.2}h`}
                  icon={<FaTachometerAlt />}
                  trend={{ direction: "up", label: "Operational uptime" }}
                />
              </div>
            </div>

            {/* Interactive Revenue & Dispatch Trend Curve */}
            <div className="mb-4">
              <RevenueTrendChart
                data={stats?.monthly_data}
                title="Platform Gross Revenue & Booking Volume Curve"
              />
            </div>

            {/* Fleet Brand & Engine Utilization Row */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-lg-6">
                <FleetDistributionChart data={stats?.brand_distribution} />
              </div>
              <div className="col-12 col-lg-6">
                <EngineMeterMetricsChart
                  totalHours={stats?.total_meter_hours || 184.2}
                  activeTrips={stats?.active_bookings || 0}
                  completedTrips={stats?.completed_bookings || 0}
                />
              </div>
            </div>

            {/* 4 Analytics Grid Cards */}
            <div className="row g-4 mb-4">
              {/* Most Rented Tractors */}
              <div className="col-12 col-md-6">
                <div
                  className="p-4 rounded-3 h-100"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaTractor style={{ color: "var(--primary-600)" }} /> Most Rented Tractors
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {!stats?.top_tractors || stats.top_tractors.length === 0 ? (
                      <p className="text-muted small py-3 mb-0">No tractor rental records available.</p>
                    ) : (
                      stats.top_tractors.map((t) => (
                        <div
                          key={t.id}
                          className="d-flex justify-content-between align-items-center p-3 rounded-2"
                          style={{ backgroundColor: "var(--slate-50)" }}
                        >
                          <div>
                            <div className="fw-bold text-dark">{t.name}</div>
                            <div className="text-secondary small">
                              {t.brand} • ₹{t.rent_per_day}/day
                            </div>
                          </div>
                          <Badge variant="success">{t.booking_count} Rentals</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Most Active Owners */}
              <div className="col-12 col-md-6">
                <div
                  className="p-4 rounded-3 h-100"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaUserCheck style={{ color: "var(--primary-600)" }} /> Most Active Owners
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {!stats?.top_owners || stats.top_owners.length === 0 ? (
                      <p className="text-muted small py-3 mb-0">No owner data available.</p>
                    ) : (
                      stats.top_owners.map((o) => (
                        <div
                          key={o.id}
                          className="d-flex justify-content-between align-items-center p-3 rounded-2"
                          style={{ backgroundColor: "var(--slate-50)" }}
                        >
                          <div>
                            <div className="fw-bold text-dark">
                              {o.first_name} {o.last_name || ""}
                            </div>
                            <div className="text-secondary small">{o.email}</div>
                          </div>
                          <Badge variant="primary">{o.tractor_count} Tractors</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Most Active Customers */}
              <div className="col-12 col-md-6">
                <div
                  className="p-4 rounded-3 h-100"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaUsers style={{ color: "var(--warning)" }} /> Most Active Farmers
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {!stats?.top_customers || stats.top_customers.length === 0 ? (
                      <p className="text-muted small py-3 mb-0">No customer records available.</p>
                    ) : (
                      stats.top_customers.map((c) => (
                        <div
                          key={c.id}
                          className="d-flex justify-content-between align-items-center p-3 rounded-2"
                          style={{ backgroundColor: "var(--slate-50)" }}
                        >
                          <div>
                            <div className="fw-bold text-dark">
                              {c.first_name || "Farmer"} {c.last_name || `#${c.id}`}
                            </div>
                            <div className="text-secondary small">{c.email}</div>
                          </div>
                          <Badge variant="warning">{c.booking_count} Bookings</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Popular Locations */}
              <div className="col-12 col-md-6">
                <div
                  className="p-4 rounded-3 h-100"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaMapMarkerAlt style={{ color: "var(--danger)" }} /> Popular Hubs / Districts
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {!stats?.popular_locations || stats.popular_locations.length === 0 ? (
                      <p className="text-muted small py-3 mb-0">No location data available.</p>
                    ) : (
                      stats.popular_locations.map((l, idx) => (
                        <div
                          key={idx}
                          className="d-flex justify-content-between align-items-center p-3 rounded-2"
                          style={{ backgroundColor: "var(--slate-50)" }}
                        >
                          <div>
                            <div className="fw-bold text-dark">{l.district || "Ahmedabad"}</div>
                            <div className="text-secondary small">Regional Dispatch Zone</div>
                          </div>
                          <Badge variant="info">{l.tractor_count} Tractors Available</Badge>
                        </div>
                      ))
                    )}
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

export default AdminReports;
