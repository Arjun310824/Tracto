import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  FaMapMarkerAlt,
  FaTools,
  FaBolt,
  FaFilter,
} from "react-icons/fa";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

function AIRecommendation() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

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

  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_BASE}${imagePath}`;
  };

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

    setAnalysisStep(language === "gu" ? "🧠 પાક અને જમીનની ગુણવત્તા તપાસી રહ્યા છીએ..." : "🧠 Analyzing Crop & Land Soil Profile...");
    await new Promise((r) => setTimeout(r, 400));

    setAnalysisStep(language === "gu" ? "⚙️ જરૂરિયાત મુજબ હોર્સપાવર (HP) ની ગણતરી કરી રહ્યા છીએ..." : "⚙️ Calculating Target Horsepower & Soil Resistance...");
    await new Promise((r) => setTimeout(r, 400));

    setAnalysisStep(language === "gu" ? "⛽ ડીઝલ વપરાશ અને અંદાજિત કલાકો માપી રહ્યા છીએ..." : "⛽ Estimating Fuel Consumption & Operation Time...");
    await new Promise((r) => setTimeout(r, 400));

    setAnalysisStep(language === "gu" ? "🎯 ઉપલબ્ધ શ્રેષ્ઠ ટ્રેક્ટર મેચ કરી રહ્યા છીએ..." : "🎯 Matching Best Machinery from Available Catalog...");

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

  const directTractors = results?.recommendations || results?.matched_tractors || [];
  const topTractor = directTractors.length > 0 ? directTractors[0] : null;
  const otherTractors = directTractors.slice(1);

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
                {language === "gu" ? "AI એગ્રીકલ્ચરલ મશીનરી મેચર" : "AI Agricultural Machinery Matcher"}
              </h1>
              <p className="text-light fs-6 mb-0 opacity-90 leading-relaxed">
                {language === "gu"
                  ? "તમારી જમીન, પાક અને કામના આધારે સીધા જ તમારા માટે શ્રેષ્ઠ ટ્રેક્ટર મેળવો."
                  : "Input your field size, soil type, and target crop — our AI algorithm directly recommends the best available tractors with estimated costs and diesel requirements."}
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
        <div
          className="rounded-4 p-4 mb-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h4 className="fw-bold text-dark mb-3 font-heading d-flex align-items-center gap-2">
            <FaFilter style={{ color: "var(--primary-600)" }} />
            <span>{language === "gu" ? "પાક અને ખેતરની વિગત પસંદ કરો" : "Crop & Field Parameters"}</span>
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

              {/* Field Size in Acres */}
              <div className="col-12 col-md-6">
                <label className="tracto-label mb-1">2. Field Size (Acres / એકર)</label>
                <div className="input-group">
                  <input
                    type="number"
                    min="0.5"
                    max="500"
                    step="0.5"
                    className="form-control"
                    value={formData.field_size_acres}
                    onChange={(e) =>
                      setFormData({ ...formData, field_size_acres: parseFloat(e.target.value) || 1 })
                    }
                    required
                  />
                  <span className="input-group-text bg-light fw-bold text-muted">Acres</span>
                </div>
                <div className="text-muted small mt-1">Recommended: 1 to 50 acres for high-efficiency match.</div>
              </div>

              {/* Soil Type */}
              <div className="col-12 col-md-6">
                <label className="tracto-label mb-1">3. Field Soil Texture</label>
                <div className="d-flex gap-2">
                  {soilTypes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`btn btn-sm flex-fill py-2 rounded-3 fw-semibold ${
                        formData.soil_type === s.id
                          ? "btn-success text-white shadow-sm"
                          : "btn-light text-secondary border"
                      }`}
                      onClick={() => setFormData({ ...formData, soil_type: s.id })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task / Work Purpose */}
              <div className="col-12">
                <label className="tracto-label mb-1">4. Farming Operation / Purpose</label>
                <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
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
                loading={loading}
                loadingText={analysisStep || "Calculating Best Match..."}
              >
                <FaRobot /> {language === "gu" ? "સીધા ટ્રેક્ટર મેળવો (Run AI Match)" : "Run AI Match Analysis"}
              </Button>
            </div>
          </form>
        </div>

        {/* Dynamic Loading Feedback */}
        {loading && (
          <div
            className="rounded-4 p-5 text-center mb-4"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="tracto-spinner mb-3"
              style={{ width: "3.5rem", height: "3.5rem", color: "var(--primary-600)" }}
            />
            <h5 className="fw-bold text-dark font-heading">{analysisStep}</h5>
            <p className="text-secondary small mb-0">
              Matching horse power, soil resistance, and live owner listings in your district...
            </p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger p-3 rounded-3 mb-4 shadow-sm">{error}</div>
        )}

        {/* AI Results & DIRECT TRACTORS Section */}
        {results && (
          <div className="d-flex flex-column gap-4 mb-4">
            {/* Top Analysis Summary Bar */}
            <div
              className="rounded-4 p-4"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-3 border-bottom">
                <div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small fw-bold">
                    ✓ {language === "gu" ? "વિશ્લેષણ પૂર્ણ" : "Analysis Complete"}
                  </span>
                  <h3 className="fw-extrabold text-dark mt-2 mb-0 font-heading">
                    {language === "gu" ? "તમારા માટે ભલામણ કરેલ સીધા ટ્રેક્ટર" : "Direct Recommended Machinery for Your Land"}
                  </h3>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <Badge variant="primary" size="md">
                    {results.crop || "Crop"} • {formData.field_size_acres} Acres
                  </Badge>
                  <Badge variant="neutral" size="md">
                    Target {results.target_hp || 50} HP
                  </Badge>
                </div>
              </div>

              {/* KPI Estimates Row */}
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <FaTractor className="text-success fs-3 mb-1 mx-auto" />
                    <div className="text-muted small">Optimal Power</div>
                    <div className="fw-bold text-dark fs-5 font-heading">
                      {results.target_hp || results.recommended_hp || "50"} HP
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <FaClock className="text-info fs-3 mb-1 mx-auto" />
                    <div className="text-muted small">Estimated Time</div>
                    <div className="fw-bold text-dark fs-5 font-heading">
                      ~{results.estimated_hours || "6"} Hours
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <FaGasPump className="text-warning fs-3 mb-1 mx-auto" />
                    <div className="text-muted small">Estimated Diesel</div>
                    <div className="fw-bold text-dark fs-5 font-heading">
                      ~{results.estimated_fuel_liters || "30"} Liters
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <FaRupeeSign className="text-primary fs-3 mb-1 mx-auto" />
                    <div className="text-muted small">Estimated Total</div>
                    <div className="fw-bold text-success fs-5 font-heading">
                      ₹{results.estimated_cost?.toLocaleString() || "2,500"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECT TRACTOR RECOMMENDATION #1 (TOP MATCH SPOTLIGHT) */}
            {topTractor && (
              <div
                className="rounded-4 p-4 position-relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
                  border: "2px solid var(--primary-500)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span
                    className="px-3 py-1.5 rounded-pill text-white fw-bold small d-inline-flex align-items-center gap-1.5 shadow-sm"
                    style={{ backgroundColor: "var(--primary-600)" }}
                  >
                    <FaBolt /> #1 Best AI Match ({topTractor.match_score || 95}% Match)
                  </span>
                  <span className="small text-muted fw-semibold">
                    Directly Available for Booking
                  </span>
                </div>

                <div className="row g-4 align-items-center">
                  {/* Tractor Photo */}
                  <div className="col-12 col-md-4 text-center">
                    <div
                      className="rounded-3 overflow-hidden border bg-white position-relative"
                      style={{ height: "200px" }}
                    >
                      <img
                        src={getImageUrl(topTractor.image)}
                        alt={topTractor.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;
                        }}
                      />
                      <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white">
                        {topTractor.horsepower} HP
                      </span>
                    </div>
                  </div>

                  {/* Tractor Info & Specs */}
                  <div className="col-12 col-md-8">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <h4 className="fw-extrabold text-dark mb-1 font-heading">
                          {topTractor.name}
                        </h4>
                        <div className="text-secondary small d-flex align-items-center gap-2">
                          <span className="fw-semibold text-dark">{topTractor.brand}</span> • {topTractor.model}
                          {topTractor.district && (
                            <>
                              <span>•</span>
                              <span className="d-flex align-items-center gap-1 text-muted">
                                <FaMapMarkerAlt size={11} /> {topTractor.district}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="fw-extrabold fs-4 font-heading" style={{ color: "var(--primary-700)" }}>
                          ₹{topTractor.rent_per_day} <span className="small fs-6 fw-normal text-muted">/day</span>
                        </div>
                        {topTractor.rent_per_hour && (
                          <div className="text-muted small">₹{topTractor.rent_per_hour}/hr</div>
                        )}
                      </div>
                    </div>

                    {/* AI Agronomist Reasoning Box */}
                    <div
                      className="p-3 rounded-3 mb-3"
                      style={{
                        backgroundColor: "var(--primary-50)",
                        border: "1px solid var(--primary-200)",
                      }}
                    >
                      <div className="fw-bold text-dark small d-flex align-items-center gap-1.5 mb-1">
                        <FaRobot style={{ color: "var(--primary-600)" }} />{" "}
                        {language === "gu" ? "શા માટે આ ટ્રેક્ટર શ્રેષ્ઠ છે:" : "Why this tractor is matched:"}
                      </div>
                      <p className="small text-secondary mb-0 leading-relaxed">
                        {language === "gu" && topTractor.reason_gu ? topTractor.reason_gu : topTractor.reason_en}
                      </p>
                    </div>

                    {/* Compatible Implements */}
                    {topTractor.matching_implements && topTractor.matching_implements.length > 0 && (
                      <div className="mb-3">
                        <div className="small fw-semibold text-dark mb-1 d-flex align-items-center gap-1">
                          <FaTools size={12} className="text-muted" />{" "}
                          <span>{language === "gu" ? "જોડેલા કૃષિ ઓજારો (Implements):" : "Matching Attachments:"}</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {topTractor.matching_implements.map((imp) => (
                            <span
                              key={imp.id}
                              className="badge rounded-pill bg-light text-dark border px-2.5 py-1 small"
                            >
                              {imp.name} (+₹{imp.rent_per_hour}/hr)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Direct Action Buttons */}
                    <div className="d-flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/book-tractor/${topTractor.tractor_id || topTractor.id}`)}
                      >
                        <FaBolt /> {language === "gu" ? "આ ટ્રેક્ટર બુક કરો (Direct Book)" : "Book This Tractor Now"}
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate(`/tractor/${topTractor.tractor_id || topTractor.id}`)}
                      >
                        {language === "gu" ? "વિગત જુઓ (View Specs)" : "View Specifications"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER DIRECT RECOMMENDED TRACTORS */}
            {otherTractors.length > 0 && (
              <div>
                <h4 className="fw-bold text-dark mb-3 font-heading d-flex align-items-center gap-2">
                  <FaTractor style={{ color: "var(--primary-600)" }} />
                  <span>
                    {language === "gu"
                      ? "અન્ય ભલામણ કરેલ ટ્રેક્ટર્સ (Other Recommended Options)"
                      : "Other Matched Tractors in the Catalog"}
                  </span>
                </h4>

                <div className="row g-3">
                  {otherTractors.map((t) => (
                    <div key={t.tractor_id || t.id} className="col-12 col-md-6">
                      <div
                        className="rounded-3 p-3 h-100 d-flex flex-column justify-content-between"
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div>
                          <div className="d-flex gap-3 align-items-center mb-3">
                            <img
                              src={getImageUrl(t.image)}
                              alt={t.name}
                              className="rounded-2 border object-fit-cover"
                              style={{ width: "80px", height: "80px", flexShrink: 0 }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;
                              }}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 className="fw-bold text-dark mb-1">{t.name}</h6>
                                <span className="badge bg-success-subtle text-success fw-bold small">
                                  {t.match_score || 90}% Match
                                </span>
                              </div>
                              <div className="text-secondary small">
                                {t.horsepower} HP • {t.brand} • {t.district || "Local Hub"}
                              </div>
                              <div className="fw-bold text-success font-heading mt-1">
                                ₹{t.rent_per_day} <span className="small text-muted fw-normal">/day</span>
                                {t.rent_per_hour && (
                                  <span className="small text-muted ms-2">(₹{t.rent_per_hour}/hr)</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-secondary small bg-light p-2.5 rounded-2 mb-3">
                            {language === "gu" && t.reason_gu ? t.reason_gu : t.reason_en}
                          </p>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="d-flex gap-2 pt-2 border-top">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-grow-1"
                            onClick={() => navigate(`/book-tractor/${t.tractor_id || t.id}`)}
                          >
                            <FaBolt size={12} /> {language === "gu" ? "બુક કરો" : "Book Tractor"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tractor/${t.tractor_id || t.id}`)}
                          >
                            {language === "gu" ? "વિગતો" : "Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {directTractors.length === 0 && (
              <EmptyState
                icon={<FaTractor />}
                title="No direct tractors found for this exact combination"
                description="Try selecting a different soil type or explore all available tractors in the catalog."
                action={
                  <Button variant="primary" size="md" onClick={() => navigate("/tractors")}>
                    Browse Full Tractor Catalog
                  </Button>
                }
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AIRecommendation;
