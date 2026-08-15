import { useState, useEffect } from "react";
import { FaChartBar, FaRupeeSign, FaTractor, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaUserCheck } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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

  const maxRevenue = Math.max(...(stats?.monthly_data?.map((m) => m.revenue) || [10000]), 10000);

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
              <h2 className="fw-extrabold text-dark m-0">📊 Admin Reports & Performance Analytics</h2>
              <p className="text-muted small">Visual trends for monthly revenue, top tractors, active fleet owners, top customers, and popular locations</p>
            </div>

            {/* Monthly Revenue & Bookings Bar Graph */}
            <div className="glass-card p-4 mb-4">
              <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <FaChartBar className="text-success" /> Monthly Revenue & Bookings Trend (₹)
              </h5>
              <p className="text-muted small mb-4">Bar chart breakdown of platform earnings and booking volumes</p>

              {stats?.monthly_data?.length === 0 ? (
                <div className="text-center py-4 text-muted small">No monthly revenue data available yet.</div>
              ) : (
                <div className="d-flex align-items-end justify-content-between gap-3 pt-5 px-3 border-bottom pb-2" style={{ height: 260 }}>
                  {stats?.monthly_data?.map((item, idx) => {
                    const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 15);
                    return (
                      <div key={idx} className="flex-fill text-center d-flex flex-column align-items-center h-100 justify-content-end">
                        <div className="small fw-bold text-dark mb-1">TRC: {item.bookings}</div>
                        <span className="fw-bold text-success small mb-1">₹{item.revenue}</span>
                        <div
                          className="w-100 bg-success rounded-top transition-all"
                          style={{
                            height: `${heightPercent}%`,
                            background: "linear-gradient(180deg, #16a34a 0%, #15803d 100%)",
                            maxWidth: 60,
                          }}
                        ></div>
                        <span className="text-muted small mt-2 fw-bold">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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
