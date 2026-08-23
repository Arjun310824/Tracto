import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaTractor, FaShieldAlt, FaClock, FaCheckCircle, FaStar, FaArrowRight, FaMapMarkerAlt, FaRobot } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TractorCard from "../components/TractorCard";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [featuredTractors, setFeaturedTractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTractors();
  }, []);

  const fetchFeaturedTractors = async () => {
    try {
      const res = await api.get("tractors/");
      const data = res.data.results || res.data || [];
      setFeaturedTractors(data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching featured tractors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (location) query.set("location", location);
    navigate(`/tractors?${query.toString()}`);
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      {/* Hero Banner */}
      <section className="hero-wrapper text-center text-lg-start">
        <div className="container py-5 position-relative">
          <div className="row align-items-center g-4 py-4">
            <div className="col-lg-7">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
                🌾 {t("heroHeading")}
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3 leading-tight">
                {t("heroHeading")}
              </h1>
              <p className="lead text-light opacity-90 mb-4" style={{ maxWidth: 600 }}>
                {t("heroSubheading")}
              </p>

              {/* Role-Specific Quick Widget */}
              {user && user.role === "owner" ? (
                <div className="bg-white p-4 rounded-4 shadow-lg text-start" style={{ maxWidth: 640 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-warning text-dark fw-bold text-uppercase px-2.5 py-1">Owner Portal</span>
                    <span className="text-muted small">Welcome back, {user.first_name || "Partner"}!</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Manage Your Machinery & Booking Requests</h5>
                  <p className="text-secondary small mb-3">
                    Track your equipment fleet, accept or decline rental requests from farmers, and monitor revenue payouts.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Link to="/owner-dashboard" className="btn btn-tracto-primary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5">
                      <FaTractor /> Go to Owner Dashboard
                    </Link>
                    <Link to="/add-tractor" className="btn btn-outline-success rounded-pill px-3 py-2 fw-semibold">
                      ➕ Add New Tractor
                    </Link>
                    <Link to="/owner-bookings" className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold">
                      📋 Booking Requests
                    </Link>
                  </div>
                </div>
              ) : user && user.role === "admin" ? (
                <div className="bg-white p-4 rounded-4 shadow-lg text-start" style={{ maxWidth: 640 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-danger text-white fw-bold text-uppercase px-2.5 py-1">Admin Control Center</span>
                    <span className="text-muted small">Platform Management</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Platform Administration & Oversight</h5>
                  <p className="text-secondary small mb-3">
                    Review tractor listings, verify user accounts, oversee live bookings, and analyze business metrics.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Link to="/admin-dashboard" className="btn btn-danger rounded-pill px-3 py-2 fw-semibold">
                      🛡️ Admin Dashboard
                    </Link>
                    <Link to="/admin-tractors" className="btn btn-outline-danger rounded-pill px-3 py-2 fw-semibold">
                      🚜 Tractor Approvals
                    </Link>
                    <Link to="/admin-bookings" className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold">
                      📋 All Bookings
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Quick Search Widget for Farmers / Customers / Guests */}
                  <form onSubmit={handleSearchSubmit} className="bg-white p-3 rounded-4 shadow-lg d-flex flex-column flex-md-row gap-2" style={{ maxWidth: 640 }}>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 text-muted">
                        <FaTractor />
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 text-dark"
                        placeholder={t("searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 text-muted">
                        <FaMapMarkerAlt />
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 text-dark"
                        placeholder="Sanand, Ahmedabad..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-tracto-primary rounded-3 px-4 d-flex align-items-center justify-content-center gap-2 text-nowrap">
                      <FaSearch /> {t("exploreTractors")}
                    </button>
                  </form>

                  <div className="d-flex align-items-center gap-3 mt-4 flex-wrap">
                    <Link to="/ai-advisor" className="btn btn-warning text-dark fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                      <FaRobot /> {t("instantAiAdvisor")}
                    </Link>
                    <Link to="/breakdown-support" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                      🚨 {t("breakdownSupport")}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Value Props */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="fw-extrabold text-dark">{t("howItWorks")}</h2>
            <p className="text-muted">Real-world safety, verified equipment, and reliable agricultural logistics</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-flex mb-3 fs-3">
                  <FaTractor />
                </div>
                <h5 className="fw-bold">{t("step1Title")}</h5>
                <p className="text-muted small">{t("step1Desc")}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-3 fs-3">
                  <FaMapMarkerAlt />
                </div>
                <h5 className="fw-bold">{t("step2Title")}</h5>
                <p className="text-muted small">{t("step2Desc")}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-warning-subtle text-warning p-3 rounded-circle d-inline-flex mb-3 fs-3">
                  <FaClock />
                </div>
                <h5 className="fw-bold">{t("step3Title")}</h5>
                <p className="text-muted small">{t("step3Desc")}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-info-subtle text-info p-3 rounded-circle d-inline-flex mb-3 fs-3">
                  <FaCheckCircle />
                </div>
                <h5 className="fw-bold">{t("step4Title")}</h5>
                <p className="text-muted small">{t("step4Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tractors Grid */}
      <section className="py-5">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-success fw-bold small text-uppercase tracking-wider">Top Rated Vehicles</span>
              <h2 className="fw-extrabold text-dark m-0">Featured Tractors Near You</h2>
            </div>
            <Link to="/tractors" className="btn btn-outline-success rounded-pill d-flex align-items-center gap-2">
              View All Tractors <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredTractors.map((tractor) => (
                <div key={tractor.id} className="col-md-6 col-lg-4">
                  <TractorCard tractor={tractor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action for Tractor Owners */}
      <section className="py-5 bg-dark text-white position-relative overflow-hidden">
        <div className="container py-4 text-center position-relative z-1">
          <h2 className="display-6 fw-extrabold mb-3">Are You a Tractor Owner?</h2>
          <p className="lead text-light opacity-80 mb-4" style={{ maxWidth: 650, margin: "0 auto" }}>
            Earn extra income by renting out your idle tractors to verified farmers in your district. Free registration & low commission.
          </p>
          <Link to="/register" className="btn btn-tracto-accent btn-lg rounded-pill px-5">
            List Your Tractor Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-secondary py-4 border-top border-secondary">
        <div className="container text-center small">
          <p className="m-0">© 2026 TRACTO Equipment Rental System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;