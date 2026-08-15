import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { FaRobot, FaTractor, FaGasPump, FaClock, FaCheckCircle, FaSeedling, FaSlidersH, FaRupeeSign, FaStar, FaInfoCircle } from "react-icons/fa";

function AIRecommendation() {
  const navigate = useNavigate();

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

    // Simulate real-time AI calculation steps for WOW factor
    setAnalysisStep("🧠 Analyzing Crop & Land Profile...");
    await new Promise((r) => setTimeout(r, 600));

    setAnalysisStep("⚙️ Calculating Target Horsepower & Soil Resistance...");
    await new Promise((r) => setTimeout(r, 600));

    setAnalysisStep("⛽ Estimating Fuel Consumption & Operation Time...");
    await new Promise((r) => setTimeout(r, 600));

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
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-4">
        {/* Header Banner */}
        <div className="bg-dark text-white rounded-4 p-4 p-md-5 mb-4 shadow-lg position-relative overflow-hidden border border-success border-2">
          <div className="row align-items-center position-relative z-1">
            <div className="col-md-8">
              <span className="badge bg-success text-white px-3 py-2 rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-2">
                <FaRobot /> Smart AI Engine v2.0
              </span>
              <h1 className="fw-bold display-6 text-white mb-2">
                AI Agricultural Machinery Matcher
              </h1>
              <p className="text-light fs-5 mb-0 opacity-90">
                પાક, જમીન અને જરૂરિયાત મુજબ AI દ્વારા સૌથી શ્રેષ્ઠ ટ્રેક્ટર, ઓજાર અને બળતણનો અંદાજ મેળવો.
              </p>
            </div>
            <div className="col-md-4 text-center mt-3 mt-md-0">
              <div className="display-1 text-success opacity-75">
                <FaTractor />
              </div>
            </div>
          </div>
        </div>

        {/* AI Form & Results Layout */}
        <div className="row g-4">
          {/* Left Form Column */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "90px" }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                <FaSlidersH className="text-success" /> Select Farming Details
              </h5>

              <form onSubmit={handleAnalyze}>
                {/* Crop Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">1. Crop Type (પાકની માહિતી)</label>
                  <div className="d-flex flex-wrap gap-2">
                    {crops.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className={`btn btn-sm rounded-pill px-3 py-2 transition-all ${
                          formData.crop_type === c.id
                            ? "btn-success shadow-sm fw-bold"
                            : "btn-outline-secondary border-light-subtle"
                        }`}
                        onClick={() => setFormData({ ...formData, crop_type: c.id })}
                      >
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field Size Slider */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold small text-secondary">2. Field Size (જમીનનું ક્ષેત્રફળ)</label>
                    <span className="badge bg-success fs-6 rounded-pill px-3 py-1 fw-bold">
                      {formData.field_size_acres} Acres (એકર)
                    </span>
                  </div>
                  <input
                    type="range"
                    className="form-range text-success"
                    min="1"
                    max="50"
                    step="1"
                    value={formData.field_size_acres}
                    onChange={(e) => setFormData({ ...formData, field_size_acres: parseFloat(e.target.value) })}
                  />
                  <div className="d-flex justify-content-between text-muted small">
                    <span>1 Acre</span>
                    <span>25 Acres</span>
                    <span>50 Acres</span>
                  </div>
                </div>

                {/* Soil Type */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">3. Soil Type (જમીનનો પ્રકાર)</label>
                  <select
                    className="form-select rounded-3 border-secondary-subtle"
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  >
                    {soilTypes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Purpose */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-secondary">4. Agricultural Task (કામનો પ્રકાર)</label>
                  <select
                    className="form-select rounded-3 border-secondary-subtle"
                    value={formData.task_purpose}
                    onChange={(e) => setFormData({ ...formData, task_purpose: e.target.value })}
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3"
                >
                  <FaRobot /> {loading ? "Analyzing..." : "Generate AI Recommendation"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Results Column */}
          <div className="col-lg-7">
            {loading && (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-auto">
                <div className="spinner-grow text-success mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status"></div>
                <h5 className="fw-bold text-dark mb-2">AI Processing Engine Active</h5>
                <p className="text-success fw-medium animate-pulse">{analysisStep}</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
                {error}
              </div>
            )}

            {!loading && !results && !error && (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <div className="display-3 text-success opacity-50 mb-3">
                  <FaSeedling />
                </div>
                <h5 className="fw-bold text-dark">Ready to Recommend</h5>
                <p className="mb-0"> Select your crop, field size, and task on the left to get instant AI recommendations.</p>
              </div>
            )}

            {results && !loading && (
              <div>
                {/* AI Summary Banner */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border-start border-success border-4">
                  <h6 className="text-uppercase text-success fw-bold small mb-2">AI Analysis Summary</h6>
                  <div className="row g-3">
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Target HP</div>
                      <div className="fs-5 fw-bold text-dark">{results.target_hp} HP</div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Field Area</div>
                      <div className="fs-5 fw-bold text-dark">{results.field_size_acres} Acres</div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">Task</div>
                      <div className="fs-5 fw-bold text-dark">{results.task_purpose}</div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="text-muted small">AI Matches</div>
                      <div className="fs-5 fw-bold text-success">{results.total_results} Found</div>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold text-dark mb-3">Top AI Recommended Machinery</h5>

                {results.recommendations.length === 0 ? (
                  <div className="alert alert-warning rounded-4">
                    No approved tractors match these exact filters currently.
                  </div>
                ) : (
                  results.recommendations.map((rec, idx) => (
                    <div key={rec.tractor_id} className="card border-0 shadow-sm rounded-4 p-4 mb-3 hover-lift transition-all">
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                        <div>
                          <span className={`badge px-3 py-1.5 rounded-pill fw-bold ${idx === 0 ? "bg-success text-white" : "bg-dark text-white"}`}>
                            #{idx + 1} Best Match ({rec.match_score}% AI Score)
                          </span>
                          <h4 className="fw-bold text-dark mb-1 mt-2">{rec.brand} {rec.model}</h4>
                          <div className="text-muted small d-flex align-items-center gap-2">
                            <span>📍 {rec.district}</span>
                            <span>•</span>
                            <span className="text-warning fw-bold d-inline-flex align-items-center gap-1">
                              <FaStar /> {rec.avg_rating}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fs-4 fw-bold text-success">
                            ₹{rec.rent_per_hour}<span className="fs-6 text-muted font-normal">/hr</span>
                          </div>
                          <div className="small text-muted">₹{rec.rent_per_day}/day</div>
                        </div>
                      </div>

                      {/* AI Estimation Metrics */}
                      <div className="bg-light rounded-3 p-3 mb-3">
                        <div className="row text-center g-2">
                          <div className="col-4 border-end">
                            <div className="text-muted small d-flex align-items-center justify-content-center gap-1">
                              <FaClock className="text-primary" /> Est. Time
                            </div>
                            <div className="fw-bold text-dark">{rec.estimated_hours} hrs</div>
                          </div>
                          <div className="col-4 border-end">
                            <div className="text-muted small d-flex align-items-center justify-content-center gap-1">
                              <FaGasPump className="text-danger" /> Est. Fuel
                            </div>
                            <div className="fw-bold text-dark">{rec.estimated_fuel_liters} Liters</div>
                          </div>
                          <div className="col-4">
                            <div className="text-muted small d-flex align-items-center justify-content-center gap-1">
                              <FaRupeeSign className="text-success" /> Est. Total
                            </div>
                            <div className="fw-bold text-success">₹{rec.estimated_total_cost}</div>
                          </div>
                        </div>
                      </div>

                      {/* Bilingual Reason */}
                      <div className="alert alert-light border border-secondary-subtle rounded-3 py-2 px-3 mb-3 small">
                        <div className="fw-bold text-dark d-flex align-items-center gap-1 mb-1">
                          <FaInfoCircle className="text-success" /> AI Insight (ગુજરાતી)
                        </div>
                        <div className="text-secondary">{rec.reason_gu}</div>
                      </div>

                      {/* Attached Implements if any */}
                      {rec.matching_implements.length > 0 && (
                        <div className="mb-3">
                          <span className="small fw-semibold text-muted d-block mb-1">Recommended Attached Implements:</span>
                          <div className="d-flex flex-wrap gap-2">
                            {rec.matching_implements.map((imp) => (
                              <span key={imp.id} className="badge bg-secondary-subtle text-dark border px-2.5 py-1.5 rounded-pill">
                                🔧 {imp.name} (+₹{imp.rent_per_hour}/hr)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTA Button */}
                      <button
                        className="btn btn-success rounded-pill fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={() => navigate(`/book-tractor/${rec.tractor_id}`)}
                      >
                        <FaCheckCircle /> Book This Machinery Now
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIRecommendation;
