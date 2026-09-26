import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTractor,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaMapMarkerAlt,
  FaRobot,
  FaSeedling,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TractorCard from "../components/TractorCard";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

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
    if (search.trim()) query.set("search", search.trim());
    if (location.trim()) query.set("location", location.trim());
    navigate(`/tractors?${query.toString()}`);
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      {/* Hero Banner */}
      <section className="hero-wrapper text-center text-lg-start">
        <div className="container py-4 py-md-5 position-relative">
          <div className="row align-items-center g-4 py-2">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 bg-success bg-opacity-25 text-white border border-success border-opacity-50 px-3.5 py-1.5 rounded-pill fw-semibold mb-3 small backdrop-blur">
                <FaSeedling className="text-warning" />
                <span>{t("brand") || "TRACTO"} — Modern Farm Machinery Sharing</span>
              </div>

              <h1 className="display-5 display-md-4 fw-extrabold text-white mb-3 leading-tight font-heading">
                {t("heroHeading") || "Rent Verified Tractors & Harvesters Across India"}
              </h1>

              <p className="lead text-light opacity-90 mb-4 fs-6 fs-md-5" style={{ maxWidth: 620 }}>
                {t("heroSubheading") || "Connect directly with local equipment owners. Book heavy farm machinery by the hour or day with instant confirmation & verified operators."}
              </p>

              {/* Role-Specific Quick Card */}
              {user && user.role === "owner" ? (
                <div className="bg-white p-4 rounded-4 shadow-lg text-start" style={{ maxWidth: 640 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge variant="warning">Owner Portal</Badge>
                    <span className="text-muted small">Welcome back, {user.first_name || "Partner"}!</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Manage Your Machinery & Booking Requests</h5>
                  <p className="text-secondary small mb-3">
                    Track your equipment fleet, accept or decline rental requests from farmers, and monitor revenue payouts.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/owner-dashboard")}
                      icon={<FaTractor />}
                    >
                      Owner Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/add-tractor")}
                    >
                      ➕ Add New Tractor
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate("/owner-bookings")}
                    >
                      📋 Booking Requests
                    </Button>
                  </div>
                </div>
              ) : user && user.role === "admin" ? (
                <div className="bg-white p-4 rounded-4 shadow-lg text-start" style={{ maxWidth: 640 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge variant="danger">Admin Control Center</Badge>
                    <span className="text-muted small">Platform Administration</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Platform Administration & Oversight</h5>
                  <p className="text-secondary small mb-3">
                    Review tractor listings, verify user accounts, oversee live bookings, and analyze business metrics.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="danger"
                      onClick={() => navigate("/admin-dashboard")}
                    >
                      🛡️ Admin Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin-tractors")}
                    >
                      🚜 Tractor Approvals
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate("/admin-bookings")}
                    >
                      📋 All Bookings
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Quick Search Widget for Farmers & Visitors */}
                  <form
                    onSubmit={handleSearchSubmit}
                    className="bg-white p-2.5 p-md-3 rounded-4 shadow-lg d-flex flex-column flex-md-row gap-2 border"
                    style={{ maxWidth: 660, borderColor: "var(--border-subtle)" }}
                  >
                    <div className="input-group align-items-center bg-light rounded-3 px-3 py-1 border flex-grow-1">
                      <FaTractor className="text-success me-2" />
                      <input
                        type="text"
                        className="form-control border-0 bg-transparent text-dark shadow-none ps-0"
                        placeholder={t("searchPlaceholder") || "Tractor model or brand (e.g. Mahindra 575)"}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search tractor model"
                      />
                    </div>

                    <div className="input-group align-items-center bg-light rounded-3 px-3 py-1 border flex-grow-1">
                      <FaMapMarkerAlt className="text-danger me-2" />
                      <input
                        type="text"
                        className="form-control border-0 bg-transparent text-dark shadow-none ps-0"
                        placeholder="District or City (e.g. Ahmedabad)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        aria-label="Search location"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      icon={<FaSearch />}
                      className="px-4 py-2.5 text-nowrap"
                    >
                      {t("exploreTractors") || "Explore Fleet"}
                    </Button>
                  </form>

                  <div className="d-flex align-items-center gap-2.5 mt-3.5 flex-wrap justify-content-center justify-content-lg-start">
                    <Link
                      to="/ai-advisor"
                      className="btn btn-warning text-dark fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                    >
                      <FaRobot /> {t("instantAiAdvisor") || "Ask AI Machinery Advisor"}
                    </Link>
                    <Link
                      to="/tractors"
                      className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold"
                    >
                      🚜 View All 500+ Tractors
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Value Proposition */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-2">
          <div className="text-center mb-5">
            <span className="text-success fw-bold small text-uppercase tracking-wider">Simple & Transparent</span>
            <h2 className="fw-extrabold text-dark mt-1 font-heading">{t("howItWorks") || "How TRACTO Works"}</h2>
            <p className="text-muted" style={{ maxWidth: 540, margin: "0 auto" }}>
              Book high-performance equipment in 4 simple steps without middlemen
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-12 col-sm-6 col-lg-3">
              <Card className="h-100 p-4 border bg-light text-center">
                <div
                  className="p-3 rounded-circle d-inline-flex mb-3 fs-3 mx-auto shadow-sm"
                  style={{ background: "var(--primary-50)", color: "var(--primary-600)" }}
                >
                  <FaTractor />
                </div>
                <h5 className="fw-bold font-heading mb-2">{t("step1Title") || "1. Select Equipment"}</h5>
                <p className="text-muted small mb-0">{t("step1Desc") || "Choose from 500+ verified tractors, rotavators, and harvesters near you."}</p>
              </Card>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <Card className="h-100 p-4 border bg-light text-center">
                <div
                  className="p-3 rounded-circle d-inline-flex mb-3 fs-3 mx-auto shadow-sm"
                  style={{ background: "var(--info-bg)", color: "var(--info-solid)" }}
                >
                  <FaMapMarkerAlt />
                </div>
                <h5 className="fw-bold font-heading mb-2">{t("step2Title") || "2. Choose Dates"}</h5>
                <p className="text-muted small mb-0">{t("step2Desc") || "Pick convenient hourly or daily rental slots with optional attachments."}</p>
              </Card>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <Card className="h-100 p-4 border bg-light text-center">
                <div
                  className="p-3 rounded-circle d-inline-flex mb-3 fs-3 mx-auto shadow-sm"
                  style={{ background: "var(--warning-bg)", color: "var(--warning-solid)" }}
                >
                  <FaClock />
                </div>
                <h5 className="fw-bold font-heading mb-2">{t("step3Title") || "3. Instant Confirmation"}</h5>
                <p className="text-muted small mb-0">{t("step3Desc") || "Get fast approval from the local tractor owner with GPS tracking."}</p>
              </Card>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <Card className="h-100 p-4 border bg-light text-center">
                <div
                  className="p-3 rounded-circle d-inline-flex mb-3 fs-3 mx-auto shadow-sm"
                  style={{ background: "var(--primary-50)", color: "var(--primary-700)" }}
                >
                  <FaCheckCircle />
                </div>
                <h5 className="fw-bold font-heading mb-2">{t("step4Title") || "4. Secure Pay & Work"}</h5>
                <p className="text-muted small mb-0">{t("step4Desc") || "Pay online or cash upon field arrival. Rate your experience after work."}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tractors Grid */}
      <section className="py-5" style={{ backgroundColor: "var(--bg-app)" }}>
        <div className="container py-2">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <span className="text-success fw-bold small text-uppercase tracking-wider">Top Rated Vehicles</span>
              <h2 className="fw-extrabold text-dark m-0 font-heading">Featured Machinery Near You</h2>
            </div>
            <Link
              to="/tractors"
              className="btn btn-outline-success rounded-pill d-flex align-items-center gap-2 fw-semibold px-3 py-1.5"
            >
              <span>View All Tractors</span>
              <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="tracto-spinner" style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }} />
              <p className="text-muted small mt-2">Loading available fleet...</p>
            </div>
          ) : (
            <div className="row g-4">
              {featuredTractors.map((tractor) => (
                <div key={tractor.id} className="col-12 col-md-6 col-lg-4">
                  <TractorCard tractor={tractor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Owner CTA Section */}
      <section className="py-5 bg-dark text-white position-relative overflow-hidden mt-auto">
        <div className="container py-4 text-center position-relative z-1">
          <Badge variant="accent" size="md" className="mb-3">
            Earn With TRACTO
          </Badge>
          <h2 className="display-6 fw-extrabold mb-3 font-heading">Are You a Tractor or Harvester Owner?</h2>
          <p className="lead text-light opacity-80 mb-4" style={{ maxWidth: 660, margin: "0 auto" }}>
            Put your idle tractors to work. List your machinery on TRACTO, receive verified booking requests from nearby farmers, and receive timely payouts with zero hassle.
          </p>
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate("/register")}
            icon={<FaTractor />}
          >
            List Your Tractor Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-secondary py-4 border-top border-dark">
        <div className="container text-center small">
          <p className="m-0 text-muted">© 2026 TRACTO — Agricultural Equipment & Tractor Rental Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;