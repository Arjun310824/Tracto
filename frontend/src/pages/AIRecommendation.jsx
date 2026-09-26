import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";
import {
  FaRobot,
  FaTractor,
  FaGasPump,
  FaClock,
  FaCheckCircle,
  FaRupeeSign,
  FaStar,
  FaInfoCircle,
  FaArrowRight,
} from "react-icons/fa";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

function AIRecommendation() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    crop_type: "cotton",
    field_size_acres: 5,
    soil_type: "medium",
    task_purpose: "plowing",
  });

  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const crops = [
    { id: "cotton", label: "Cotton (કપાસ)", icon: "🌱" },
    { id: "wheat", label: "Wheat (ઘઉં)", icon: "🌾" },
    { id: "groundnut", label: "Groundnut (મગફળી)", icon: "🥜" },
    { id: "sugarcane", label: "Sugarcane (શેરડી)", icon: "🎋" },
    { id: "paddy", label: "Paddy (ડાંગર)", icon: "🌾" },
    { id: "vegetables", label: "Vegetables (શાકભાજી)", icon: "🥦" },
    { id: "general", label: "General Farming", icon: "🚜" },
  ];

  const soilTypes = [
    { id: "soft", label: "Soft / Sandy (નરમ)" },
    { id: "medium", label: "Medium Black (મધ્યમ કાળી)" },
    { id: "hard", label: "Hard Clay (કઠણ/કાળી)" },
  ];

  const tasks = [
    { id: "plowing", label: "Deep Plowing (ખેડ)" },
    { id: "rotavating", label: "Rotavator (રોટાવેટર)" },
    { id: "seeding", label: "Seeding / Sowing (વાવણી)" },
    { id: "harvesting", label: "Harvesting (કાપણી)" },
    { id: "leveling", label: "Land Leveling (સમતલ)" },
    { id: "transport", label: "Haulage / Trolley (પરિવહન)" },
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    setAnalysisStep("🧠 Analyzing Crop & Land Soil Profile...");
    await new Promise((r) => setTimeout(r, 500));

    setAnalysisStep("⚙️ Calculating Target Horsepower & Soil Resistance...");
    await new Promise((r) => setTimeout(r, 500));

    setAnalysisStep("⛽ Estimating Fuel Consumption & Operation Time...");
    await new Promise((r) => setTimeout(r, 500));

    setAnalysisStep("🎯 Matching Best Machinery from Available Catalog...");

    try {
      const res = await api.post("rental/ai-recommend/", formData);
      setResults(res.data);
    } catch (err) {
      console.error("AI Recommendation error:", err);
      setError("Unable to process AI recommendation. Please try again.");
    } finally {
      setLoading(false);
      setAnalysisStep("");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Header Hero Banner */}
        <div
          className="rounded-4 p-4 p-md-5 mb-4 text-white shadow-lg position-relative overflow-hidden border"
          style={{
            background: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
            borderColor: "rgba(52, 211, 153, 0.3)",
          }}
        >
          <div className="row align-items-center position-relative z-1">
            <div className="col-12 col-md-8">
              <span className="badge bg-success text-white px-3 py-1.5 rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-2">
                <FaRobot /> Smart AI Engine v2.0
              </span>
              <h1 className="fw-extrabold display-6 text-white mb-2 font-heading">
                {t("aiHeroTitle") || "AI Farm Machinery Advisor"}
              </h1>
              <p className="text-light fs-6 mb-0 opacity-90 leading-relaxed">
                {t("aiHeroSub") || "Tell our algorithm your land size, soil type, and target crop — we'll calculate exact HP needed and estimate fuel & hours."}
              </p>
            </div>
            <div className="col-12 col-md-4 text-center text-md-end mt-3 mt-md-0">
              <div className="display-3 text-success opacity-80">
                <FaRobot />
              </div>
            </div>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
          <h4 className="fw-extrabold text-dark mb-3 font-heading d-flex align-items-center gap-2">
            <span>🌾 Crop & Field Parameters</span>
          </h4>

          <form onSubmit={handleAnalyze}>
            <div className="row g-4">
              {/* Crop Selector */}
              <div className="col-12">
                <label className="tracto-label mb-2">1. Select Target Crop</label>
                <div className="d-flex flex-wrap gap-2">
                  {crops.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 transition-all ${
                        formData.crop_type === c.id
                          ? "btn-success text-white shadow-sm"
                          : "btn-outline-secondary bg-light text-dark"
                      }`}
                      onClick={() => setFormData({ ...formData, crop_type: c.id })}
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Size */}
              <div className="col-12 col-md-4">
                <label className="tracto-label mb-1">
                  2. Field Size (Acres): <strong className="text-success ms-1">{formData.field_size_acres} Acres</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="100"
                  step="1"
                  value={formData.field_size_acres}
                  onChange={(e) => setFormData({ ...formData, field_size_acres: parseInt(e.target.value) || 1 })}
                />
                <div className="d-flex justify-content-between text-muted small">
                  <span>1 Acre</span>
                  <span>50 Acres</span>
                  <span>100 Acres</span>
                </div>
              </div>

              {/* Soil Type */}
              <div className="col-12 col-md-4">
                <label className="tracto-label mb-2">3. Soil Texture</label>
                <div className="d-flex flex-column gap-1.5">
                  {soilTypes.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`btn btn-sm text-start py-2 px-3 rounded-3 fw-semibold ${
                        formData.soil_type === st.id
                          ? "btn-success text-white shadow-sm"
                          : "btn-light text-secondary border"
                      }`}
                      onClick={() => setFormData({ ...formData, soil_type: st.id })}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farming Operation / Task */}
              <div className="col-12 col-md-4">
                <label className="tracto-label mb-2">4. Operation Task</label>
                <div className="d-flex flex-column gap-1.5">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className={`btn btn-sm text-start py-2 px-3 rounded-3 fw-semibold ${
                        formData.task_purpose === task.id
                          ? "btn-success text-white shadow-sm"
                          : "btn-light text-secondary border"
                      }`}
                      onClick={() => setFormData({ ...formData, task_purpose: task.id })}
                    >
                      {task.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                loadingText={analysisStep || "Calculating Best Match..."}
                icon={<FaRobot />}
                className="px-4"
              >
                Run AI Match Analysis
              </Button>
            </div>
          </form>
        </div>

        {/* Dynamic Loading State Feedback */}
        {loading && (
          <div className="bg-white rounded-4 border p-4 shadow-sm text-center mb-4">
            <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
            <h5 className="fw-bold text-dark mt-3 font-heading">{analysisStep}</h5>
            <p className="text-muted small">Optimizing machinery specs for your soil condition and crop...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger p-3 rounded-3 mb-4 shadow-sm">{error}</div>
        )}

        {/* AI Results Section */}
        {results && (
          <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 pb-3 border-bottom">
              <div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small fw-bold">
                  ✓ Analysis Complete
                </span>
                <h3 className="fw-extrabold text-dark mt-2 mb-0 font-heading">
                  AI Recommendation & Cost Estimate
                </h3>
              </div>
              <Badge variant="primary" size="md">
                Matched for {formData.field_size_acres} Acres
              </Badge>
            </div>

            {/* Metric Cards Row */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-lg-3">
                <Card className="p-3 bg-light border text-center">
                  <FaTractor className="text-success fs-3 mb-1 mx-auto" />
                  <div className="text-muted small">Recommended Power</div>
                  <div className="fw-extrabold text-dark fs-4 font-heading">
                    {results.recommended_hp || "45 - 55"} HP
                  </div>
                </Card>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <Card className="p-3 bg-light border text-center">
                  <FaClock className="text-info fs-3 mb-1 mx-auto" />
                  <div className="text-muted small">Estimated Time</div>
                  <div className="fw-extrabold text-dark fs-4 font-heading">
                    {results.estimated_hours || "6 - 8"} Hours
                  </div>
                </Card>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <Card className="p-3 bg-light border text-center">
                  <FaGasPump className="text-warning fs-3 mb-1 mx-auto" />
                  <div className="text-muted small">Estimated Fuel</div>
                  <div className="fw-extrabold text-dark fs-4 font-heading">
                    {results.estimated_fuel_liters || "25 - 32"} L
                  </div>
                </Card>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <Card className="p-3 bg-light border text-center">
                  <FaRupeeSign className="text-primary fs-3 mb-1 mx-auto" />
                  <div className="text-muted small">Estimated Work Cost</div>
                  <div className="fw-extrabold text-success fs-4 font-heading">
                    ₹{results.estimated_cost || "3,200"}
                  </div>
                </Card>
              </div>
            </div>

            {/* AI Advisor Rationale */}
            {results.advice && (
              <div className="p-3.5 rounded-3 bg-success-subtle text-success-emphasis border border-success-subtle mb-4">
                <div className="fw-bold d-flex align-items-center gap-1.5 mb-1">
                  <FaInfoCircle /> AI Agronomist Insight:
                </div>
                <p className="small mb-0 leading-relaxed">{results.advice}</p>
              </div>
            )}

            {/* Matched Tractors in Catalog */}
            {results.matched_tractors && results.matched_tractors.length > 0 && (
              <div>
                <h5 className="fw-bold text-dark mb-3 font-heading">Best Matched Machinery in Your Area</h5>
                <div className="row g-3">
                  {results.matched_tractors.map((t) => (
                    <div key={t.id} className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-dark fs-6">{t.name}</div>
                          <div className="text-muted small">
                            {t.horsepower} HP • {t.brand} • {t.location}
                          </div>
                          <div className="text-success fw-bold font-heading mt-1">₹{t.rent_per_day} / day</div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/book-tractor/${t.id}`)}
                          icon={<FaArrowRight />}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AIRecommendation;
