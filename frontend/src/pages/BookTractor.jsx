import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaTractor,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaStar,
  FaCogs,
  FaArrowLeft,
  FaArrowRight,
  FaSeedling,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

function BookTractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [currentStep, setCurrentStep] = useState(1);
  const [tractor, setTractor] = useState(null);
  const [implementsList, setImplementsList] = useState([]);
  const [selectedImplementIds, setSelectedImplementIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [durationMode, setDurationMode] = useState("daily"); // "daily" or "hourly"
  const [hourlyUnits, setHourlyUnits] = useState(4);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  // Land Size & Implement Calculator State
  const [farmingWorkType, setFarmingWorkType] = useState("plowing");
  const [transportBags, setTransportBags] = useState(40);
  const [transportDistanceKm, setTransportDistanceKm] = useState(15);
  const [landUnit, setLandUnit] = useState("bigha");
  const [landSize, setLandSize] = useState(5);
  const [selectedCrop, setSelectedCrop] = useState("Cotton (કપાસ)");

  const [totalAmount, setTotalAmount] = useState(0);
  const [daysCount, setDaysCount] = useState(1);
  const [implementsTotal, setImplementsTotal] = useState(0);

  const [existingBookings, setExistingBookings] = useState([]);
  const [isDateUnavailable, setIsDateUnavailable] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTractorAndImplements();
  }, [id]);

  const fetchTractorAndImplements = async () => {
    try {
      const res = await api.get(`tractors/${id}/`);
      setTractor(res.data);

      const implRes = await api.get(`implements/?tractor_id=${id}`);
      setImplementsList(implRes.data.results || implRes.data || res.data.attached_implements || []);

      const bookRes = await api.get("bookings/");
      const bookingsData = bookRes.data.results || bookRes.data || [];
      const activeForTractor = bookingsData.filter(
        (b) =>
          (b.tractor === parseInt(id) || b.tractor_details?.id === parseInt(id)) &&
          ["pending", "approved", "paid"].includes(b.status)
      );
      setExistingBookings(activeForTractor);
    } catch (err) {
      console.error("Error fetching tractor details:", err);
      setError("Tractor not found or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleImplement = (implId) => {
    if (selectedImplementIds.includes(implId)) {
      setSelectedImplementIds([]);
    } else {
      setSelectedImplementIds([implId]);
    }
  };

  // Recalculate total amount and check date availability
  useEffect(() => {
    if (!tractor) return;

    let units = 1;
    let reqStart = new Date(startDate);
    let reqEnd = durationMode === "daily" ? new Date(endDate) : new Date(startDate);

    if (durationMode === "daily") {
      if (!isNaN(reqStart) && !isNaN(reqEnd) && reqEnd >= reqStart) {
        const diffTime = Math.abs(reqEnd - reqStart);
        units = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      } else {
        units = 0;
      }
      setDaysCount(units);
    } else {
      units = hourlyUnits || 1;
    }

    let overlap = false;
    if (!isNaN(reqStart) && !isNaN(reqEnd)) {
      overlap = existingBookings.some((b) => {
        const bStart = new Date(b.start_date);
        const bEnd = new Date(b.end_date);
        return reqStart <= bEnd && reqEnd >= bStart;
      });
    }

    if (overlap) {
      setIsDateUnavailable(true);
      setError("This tractor is already reserved for the selected date range. Please choose another date.");
    } else {
      setIsDateUnavailable(false);
      setError("");
    }

    const baseRate =
      durationMode === "daily" ? parseFloat(tractor.rent_per_day) : parseFloat(tractor.rent_per_hour);
    const baseTotal = baseRate * units;

    let implAddonFee = 0;
    implementsList.forEach((impl) => {
      if (selectedImplementIds.includes(impl.id)) {
        const implRate =
          durationMode === "daily" ? parseFloat(impl.rent_per_day) : parseFloat(impl.rent_per_hour);
        implAddonFee += implRate * units;
      }
    });

    setImplementsTotal(implAddonFee);
    setTotalAmount(baseTotal + implAddonFee);
  }, [
    startDate,
    endDate,
    durationMode,
    hourlyUnits,
    tractor,
    selectedImplementIds,
    implementsList,
    existingBookings,
  ]);

  const getFilteredImplements = () => {
    if (!implementsList || implementsList.length === 0) return [];

    return implementsList.filter((impl) => {
      const name = (impl.name || "").toLowerCase();
      const desc = (impl.description || "").toLowerCase();
      const cat = (impl.category || "").toLowerCase();

      switch (farmingWorkType) {
        case "plowing":
          return (
            cat === "cultivator" ||
            name.includes("plough") ||
            name.includes("cultivator") ||
            name.includes("plow") ||
            name.includes("harrow") ||
            desc.includes("cultivator") ||
            desc.includes("plough")
          );
        case "rotavator":
          return (
            cat === "rotavator" ||
            name.includes("rotavator") ||
            name.includes("rotary") ||
            name.includes("tiller") ||
            desc.includes("rotavator")
          );
        case "sowing":
          return (
            cat === "seeder" ||
            name.includes("drill") ||
            name.includes("seeder") ||
            name.includes("sow") ||
            name.includes("planter") ||
            desc.includes("seed")
          );
        case "transport":
          return (
            cat === "trailer" ||
            name.includes("trailer") ||
            name.includes("trolley") ||
            name.includes("tipping") ||
            desc.includes("trailer") ||
            desc.includes("trolley")
          );
        case "leveling":
          return (
            cat === "leveler" ||
            name.includes("leveler") ||
            name.includes("level") ||
            name.includes("laser") ||
            desc.includes("leveler")
          );
        case "harvesting":
          return (
            cat === "harvester" ||
            name.includes("thresher") ||
            name.includes("harvester") ||
            name.includes("reaper") ||
            desc.includes("thresher")
          );
        default:
          return true;
      }
    });
  };

  const handleSelectWorkType = (typeId) => {
    setFarmingWorkType(typeId);
    if (!implementsList || implementsList.length === 0) return;

    const matching = implementsList.filter((impl) => {
      const name = (impl.name || "").toLowerCase();
      const desc = (impl.description || "").toLowerCase();
      const cat = (impl.category || "").toLowerCase();

      if (typeId === "plowing")
        return (
          cat === "cultivator" ||
          name.includes("plough") ||
          name.includes("cultivator") ||
          name.includes("plow") ||
          name.includes("harrow") ||
          desc.includes("cultivator") ||
          desc.includes("plough")
        );
      if (typeId === "rotavator")
        return (
          cat === "rotavator" ||
          name.includes("rotavator") ||
          name.includes("rotary") ||
          name.includes("tiller") ||
          desc.includes("rotavator")
        );
      if (typeId === "sowing")
        return (
          cat === "seeder" ||
          name.includes("drill") ||
          name.includes("seeder") ||
          name.includes("sow") ||
          name.includes("planter") ||
          desc.includes("seed")
        );
      if (typeId === "transport")
        return (
          cat === "trailer" ||
          name.includes("trailer") ||
          name.includes("trolley") ||
          name.includes("tipping") ||
          desc.includes("trailer")
        );
      if (typeId === "leveling")
        return (
          cat === "leveler" ||
          name.includes("leveler") ||
          name.includes("level") ||
          name.includes("laser") ||
          desc.includes("leveler")
        );
      if (typeId === "harvesting")
        return (
          cat === "harvester" ||
          name.includes("thresher") ||
          name.includes("harvester") ||
          name.includes("reaper") ||
          desc.includes("thresher")
        );
      return true;
    });

    if (matching.length > 0) {
      setSelectedImplementIds([matching[0].id]);
    } else {
      setSelectedImplementIds([]);
    }
  };

  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setSubmitting(true);
    try {
      const generatedPurpose =
        farmingWorkType === "transport"
          ? `Crop Transport: ${transportBags} bags of ${selectedCrop} to Mandi (${transportDistanceKm} km)`
          : purpose || `Agricultural ${farmingWorkType} on ${landSize} ${landUnit} ${selectedCrop} farm`;

      await api.post("bookings/", {
        tractor: tractor.id,
        selected_implements: selectedImplementIds,
        start_date: startDate,
        end_date: durationMode === "daily" ? endDate : startDate,
        rental_duration_type: durationMode,
        rental_units: durationMode === "daily" ? daysCount : hourlyUnits,
        farming_work_type: farmingWorkType,
        crop_name: selectedCrop,
        land_area_size: landSize,
        land_area_unit: landUnit,
        purpose: generatedPurpose,
        notes,
      });

      navigate("/my-bookings");
    } catch (err) {
      console.error("Error creating booking:", err);
      const errData = err.response?.data;
      if (typeof errData === "object") {
        const firstErr = Object.values(errData)[0];
        setError(Array.isArray(firstErr) ? firstErr[0] : firstErr || "Failed to submit booking request.");
      } else {
        setError("Failed to submit booking request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
        <Navbar />
        <div className="text-center py-5 my-auto">
          <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
          <p className="text-muted small mt-3">Loading booking configuration...</p>
        </div>
      </div>
    );
  }

  if (!tractor) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
        <Navbar />
        <div className="container py-5 text-center my-auto">
          <div className="alert alert-danger mb-3">{error || "Tractor not found."}</div>
          <Button variant="primary" onClick={() => navigate("/tractors")} icon={<FaArrowLeft />}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
  const defaultImg = `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;
  const tractorImg = tractor.image
    ? tractor.image.startsWith("http")
      ? tractor.image
      : `${BACKEND_BASE}${tractor.image}`
    : defaultImg;

  const steps = [
    { num: 1, title: "Work & Land" },
    { num: 2, title: "Dates & Time" },
    { num: 3, title: "Attachments" },
    { num: 4, title: "Confirm & Book" },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <main className="container py-4 flex-grow-1" style={{ maxWidth: 1060 }}>
        {/* Header and Step Wizard Bar */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Link to={`/tractor/${tractor.id}`} className="text-muted small text-decoration-none d-flex align-items-center gap-1">
              <FaArrowLeft /> Back to details
            </Link>
          </div>
          <h1 className="h3 fw-extrabold text-dark m-0 font-heading">
            Book Equipment: <span className="text-success">{tractor.name}</span>
          </h1>
          <p className="text-muted small m-0 mt-0.5">
            Configure your agricultural operation in 4 simple steps
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-4 p-3 bg-white rounded-4 border shadow-sm">
            <div className="row g-2 text-center">
              {steps.map((s) => (
                <div key={s.num} className="col-3">
                  <div
                    onClick={() => {
                      if (s.num < currentStep || !isDateUnavailable) setCurrentStep(s.num);
                    }}
                    className={`d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1.5 p-2 rounded-3 cursor-pointer transition-all ${
                      currentStep === s.num
                        ? "bg-success text-white fw-bold shadow-sm"
                        : currentStep > s.num
                        ? "bg-success-subtle text-success fw-semibold"
                        : "text-muted"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className={`badge rounded-circle d-flex align-items-center justify-content-center ${
                        currentStep === s.num
                          ? "bg-white text-success"
                          : currentStep > s.num
                          ? "bg-success text-white"
                          : "bg-light text-muted border"
                      }`}
                      style={{ width: 24, height: 24, fontSize: "0.75rem" }}
                    >
                      {currentStep > s.num ? "✓" : s.num}
                    </span>
                    <span className="small d-none d-sm-inline">{s.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger p-3 mb-4 rounded-3 d-flex align-items-center gap-2 shadow-sm">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="row g-4">
          {/* Main Wizard Step Content */}
          <div className="col-12 col-lg-7">
            <div className="bg-white rounded-4 border p-4 shadow-sm">
              {/* STEP 1: Work Purpose & Land Size */}
              {currentStep === 1 && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">
                      1. Select Agricultural Work Purpose
                    </h5>
                    <Badge variant="primary">Step 1 of 4</Badge>
                  </div>

                  <p className="text-muted small mb-3">
                    Choose what farming task you need this tractor for. We'll automatically suggest compatible implements.
                  </p>

                  <div className="row g-2 mb-4">
                    {[
                      { id: "plowing", icon: "🌾", title: "જમીન ખેડવા (Plowing)", sub: "MB Plough / Cultivator" },
                      { id: "transport", icon: "🚛", title: "પાક ટ્રાન્સપોર્ટ (Trolley)", sub: "Grain haulage to Mandi" },
                      { id: "rotavator", icon: "🔄", title: "રોટાવેટર (Rotavator)", sub: "Fine seed bed preparation" },
                      { id: "sowing", icon: "🌱", title: "વાવણી (Seed Sowing)", sub: "Automatic Seed Drill" },
                      { id: "harvesting", icon: "🚜", title: "કાપણી / થ્રેશર (Thresher)", sub: "Threshing crop grains" },
                      { id: "leveling", icon: "📐", title: "લેવલિંગ (Land Leveler)", sub: "Surface laser leveling" },
                    ].map((item) => (
                      <div key={item.id} className="col-6 col-sm-4">
                        <div
                          className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                            farmingWorkType === item.id
                              ? "bg-success text-white border-success shadow-sm"
                              : "bg-light text-dark hover-border-success"
                          }`}
                          onClick={() => handleSelectWorkType(item.id)}
                          style={{ cursor: "pointer", transition: "all 0.2s" }}
                        >
                          <div className="fs-4 mb-1">{item.icon}</div>
                          <div className="fw-bold small lh-sm">{item.title}</div>
                          <div
                            className={`mt-1 ${farmingWorkType === item.id ? "text-light opacity-90" : "text-muted"}`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {item.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transport or Land Size Calculator */}
                  {farmingWorkType === "transport" ? (
                    <div className="p-3.5 rounded-3 bg-warning-subtle text-dark border border-warning-subtle mb-4">
                      <div className="fw-bold small mb-2 d-flex align-items-center gap-1.5">
                        🚛 Trolley Haulage Details (પાક માલવહન વિગતો)
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="tracto-label mb-1" style={{ fontSize: "0.78rem" }}>Crop / Commodity</label>
                          <select
                            className="tracto-input bg-white"
                            style={{ minHeight: 38, fontSize: "0.85rem" }}
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                          >
                            <option value="Cotton (કપાસ)">Cotton (કપાસ)</option>
                            <option value="Groundnut (મગફળી)">Groundnut (મગફળી)</option>
                            <option value="Wheat (ઘઉં)">Wheat (ઘઉં)</option>
                            <option value="Paddy (ડાંગર)">Paddy (ડાંગર)</option>
                            <option value="Cumin / Spices (જીરું)">Cumin / Spices (જીરું)</option>
                          </select>
                        </div>
                        <div className="col-3">
                          <label className="tracto-label mb-1" style={{ fontSize: "0.78rem" }}>Bags (ગુણી)</label>
                          <input
                            type="number"
                            min="5"
                            className="tracto-input bg-white"
                            style={{ minHeight: 38, fontSize: "0.85rem" }}
                            value={transportBags}
                            onChange={(e) => setTransportBags(parseInt(e.target.value) || 10)}
                          />
                        </div>
                        <div className="col-3">
                          <label className="tracto-label mb-1" style={{ fontSize: "0.78rem" }}>Distance (km)</label>
                          <input
                            type="number"
                            min="1"
                            className="tracto-input bg-white"
                            style={{ minHeight: 38, fontSize: "0.85rem" }}
                            value={transportDistanceKm}
                            onChange={(e) => setTransportDistanceKm(parseInt(e.target.value) || 5)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-3 bg-success-subtle text-dark border border-success-subtle mb-4">
                      <div className="fw-bold small mb-2 d-flex align-items-center gap-1.5">
                        <FaSeedling className="text-success" /> Land Area & Fuel Estimator (ખેતરનું માપ અને અંદાજ)
                      </div>
                      <div className="row g-2 align-items-center mb-2.5">
                        <div className="col-4">
                          <label className="tracto-label mb-1" style={{ fontSize: "0.78rem" }}>Area Unit</label>
                          <select
                            className="tracto-input bg-white"
                            style={{ minHeight: 38, fontSize: "0.85rem" }}
                            value={landUnit}
                            onChange={(e) => setLandUnit(e.target.value)}
                          >
                            <option value="bigha">વીઘા (Bigha)</option>
                            <option value="acre">એકર (Acre)</option>
                            <option value="guntha">ગૂંઠા (Guntha)</option>
                          </select>
                        </div>
                        <div className="col-4">
                          <label className="tracto-label mb-1" style={{ fontSize: "0.78rem" }}>Area Size</label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            className="tracto-input bg-white"
                            style={{ minHeight: 38, fontSize: "0.85rem" }}
                            value={landSize}
                            onChange={(e) => setLandSize(parseFloat(e.target.value) || 1)}
                          />
                        </div>
                        <div className="col-4">
                          <label className="tracto-label mb-1" style={{ fontSize: "0.78rem" }}>Target Crop</label>
                          <select
                            className="tracto-input bg-white"
                            style={{ minHeight: 38, fontSize: "0.85rem" }}
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                          >
                            <option value="Cotton">કપાસ (Cotton)</option>
                            <option value="Groundnut">મગફળી (Groundnut)</option>
                            <option value="Wheat">ઘઉં (Wheat)</option>
                            <option value="Paddy">ડાંગર (Paddy)</option>
                            <option value="Cumin">જીરું (Cumin)</option>
                          </select>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center bg-white p-2.5 rounded-3 border small">
                        <span className="fw-semibold">
                          ⏱️ Est: <span className="text-primary font-monospace">{Math.round(landSize * (landUnit === "acre" ? 1.5 : landUnit === "bigha" ? 0.75 : 0.05) * 10) / 10} hrs</span>
                        </span>
                        <span className="fw-semibold">
                          ⛽ Fuel: <span className="text-warning font-monospace">{Math.round(landSize * (landUnit === "acre" ? 5.2 : landUnit === "bigha" ? 2.6 : 0.2) * 10) / 10} L</span>
                        </span>
                        <span className="fw-semibold">
                          💰 Cost: <span className="text-success font-monospace">~₹{Math.round(landSize * (landUnit === "acre" ? 5.2 : landUnit === "bigha" ? 2.6 : 0.2) * 92)}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" onClick={() => setCurrentStep(2)} icon={<FaArrowRight />} iconPosition="right">
                      Proceed to Dates & Duration
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Dates & Duration */}
              {currentStep === 2 && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">
                      2. Choose Rental Dates & Duration
                    </h5>
                    <Badge variant="primary">Step 2 of 4</Badge>
                  </div>

                  {/* Daily vs Hourly Selection */}
                  <div className="mb-4">
                    <label className="tracto-label mb-2">Select Rental Type</label>
                    <div className="row g-2">
                      <div className="col-6">
                        <div
                          className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                            durationMode === "daily"
                              ? "bg-success text-white border-success shadow-sm"
                              : "bg-light text-muted"
                          }`}
                          onClick={() => setDurationMode("daily")}
                          style={{ cursor: "pointer" }}
                        >
                          <FaCalendarAlt className="fs-4 mb-1" />
                          <div className="fw-bold">Daily Rent</div>
                          <small className={durationMode === "daily" ? "text-light opacity-90" : "text-muted"}>
                            ₹{tractor.rent_per_day} / day
                          </small>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                            durationMode === "hourly"
                              ? "bg-success text-white border-success shadow-sm"
                              : "bg-light text-muted"
                          }`}
                          onClick={() => setDurationMode("hourly")}
                          style={{ cursor: "pointer" }}
                        >
                          <FaClock className="fs-4 mb-1" />
                          <div className="fw-bold">Hourly Rent</div>
                          <small className={durationMode === "hourly" ? "text-light opacity-90" : "text-muted"}>
                            ₹{tractor.rent_per_hour} / hr
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Pickers */}
                  {durationMode === "daily" ? (
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-sm-6">
                        <label className="tracto-label">Start Date *</label>
                        <div className="tracto-input-wrapper">
                          <input
                            type="date"
                            className="tracto-input"
                            min={todayStr}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="tracto-label">End Date *</label>
                        <div className="tracto-input-wrapper">
                          <input
                            type="date"
                            className="tracto-input"
                            min={startDate}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-sm-6">
                        <label className="tracto-label">Work Date *</label>
                        <div className="tracto-input-wrapper">
                          <input
                            type="date"
                            className="tracto-input"
                            min={todayStr}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="tracto-label">Required Hours (1 - 24) *</label>
                        <div className="tracto-input-wrapper">
                          <input
                            type="number"
                            className="tracto-input"
                            min="1"
                            max="24"
                            value={hourlyUnits}
                            onChange={(e) => setHourlyUnits(parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isDateUnavailable && (
                    <div className="alert alert-danger p-3 rounded-3 mb-4 small d-flex align-items-center gap-2">
                      <FaExclamationTriangle className="flex-shrink-0" />
                      <span>This tractor is already booked for this schedule. Please select alternative dates.</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setCurrentStep(1)} icon={<FaArrowLeft />}>
                      Previous
                    </Button>
                    <Button
                      variant="primary"
                      disabled={isDateUnavailable}
                      onClick={() => setCurrentStep(3)}
                      icon={<FaArrowRight />}
                      iconPosition="right"
                    >
                      Proceed to Attachments
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Implements / Attachments */}
              {currentStep === 3 && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">
                      3. Select Machinery Attachments
                    </h5>
                    <Badge variant="primary">Step 3 of 4</Badge>
                  </div>

                  <p className="text-muted small mb-3">
                    Choose an attachment to hook up to the tractor or proceed with only the tractor at zero extra cost.
                  </p>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {/* Option: Tractor Only */}
                    <div
                      className={`p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer transition-all ${
                        selectedImplementIds.length === 0
                          ? "bg-success-subtle border-success shadow-sm"
                          : "bg-white hover-border-success"
                      }`}
                      onClick={() => setSelectedImplementIds([])}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2.5">
                        <input
                          type="radio"
                          name="selectedImplementRadio"
                          className="form-check-input mt-0"
                          checked={selectedImplementIds.length === 0}
                          onChange={() => setSelectedImplementIds([])}
                        />
                        <div>
                          <div className="fw-bold text-dark small">ફક્ત ટ્રેક્ટર (Only Tractor - No Attachment)</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            Tractor only with standard hitch connection
                          </div>
                        </div>
                      </div>
                      <Badge variant="neutral">₹0 Extra</Badge>
                    </div>

                    {/* Filtered Implement List */}
                    {getFilteredImplements().length > 0 ? (
                      getFilteredImplements().map((impl) => {
                        const isChecked = selectedImplementIds.includes(impl.id);
                        const rateStr =
                          durationMode === "daily"
                            ? `+₹${impl.rent_per_day}/day`
                            : `+₹${impl.rent_per_hour}/hr`;
                        return (
                          <div
                            key={impl.id}
                            className={`p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer transition-all ${
                              isChecked
                                ? "bg-success-subtle border-success shadow-sm"
                                : "bg-white hover-border-success"
                            }`}
                            onClick={() => handleToggleImplement(impl.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex align-items-center gap-2.5">
                              <input
                                type="radio"
                                name="selectedImplementRadio"
                                className="form-check-input mt-0"
                                checked={isChecked}
                                onChange={() => handleToggleImplement(impl.id)}
                              />
                              <div>
                                <div className="fw-bold text-dark small">{impl.name}</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                  {impl.description || "Farm implement attachment"}
                                </div>
                              </div>
                            </div>
                            <Badge variant="success">{rateStr}</Badge>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-muted small p-3 bg-light rounded-3 border text-center">
                        No specific attachments listed for this work type. You can rent the tractor with standard linkage.
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setCurrentStep(2)} icon={<FaArrowLeft />}>
                      Previous
                    </Button>
                    <Button variant="primary" onClick={() => setCurrentStep(4)} icon={<FaArrowRight />} iconPosition="right">
                      Review & Confirm
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review, Dispatch Address & Final Submit */}
              {currentStep === 4 && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">
                      4. Dispatch Destination & Final Review
                    </h5>
                    <Badge variant="success">Final Step</Badge>
                  </div>

                  <form onSubmit={handleSubmitBooking}>
                    {/* Farm Dispatch Location */}
                    <div className="mb-3">
                      <Input
                        label="Pickup / Farm Destination Location"
                        placeholder="Enter your Village / Farm Survey No. (e.g. Survey 42, Sanand, Ahmedabad)"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        icon={<FaMapMarkerAlt className="text-danger" />}
                        required
                        helperText="The tractor owner or driver will coordinate delivery to this exact location"
                      />
                    </div>

                    {/* Delivery Preference */}
                    <div className="mb-3">
                      <label className="tracto-label">Delivery Preference</label>
                      <div className="tracto-input-wrapper">
                        <select className="tracto-input" defaultValue="owner_delivers">
                          <option value="owner_delivers">🚜 Owner / Driver Delivers Tractor to My Farm</option>
                          <option value="customer_pickup">🔑 Self Pickup from Owner Yard</option>
                        </select>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="mb-4">
                      <label className="tracto-label">Special Requests or Notes to Owner</label>
                      <textarea
                        className="tracto-input p-2.5 rounded-3 border"
                        rows="2"
                        placeholder="Add landmark details, timing preferences, or specific field instructions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ width: "100%", outline: "none", borderColor: "var(--border-subtle)" }}
                      />
                    </div>

                    <div className="d-flex justify-content-between pt-2 border-top">
                      <Button variant="secondary" onClick={() => setCurrentStep(3)} icon={<FaArrowLeft />}>
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={submitting}
                        loadingText="Sending Request..."
                        disabled={isDateUnavailable}
                        icon={<FaCheckCircle />}
                      >
                        Submit Booking Request
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Live Price Summary & Tractor Card */}
          <div className="col-12 col-lg-5">
            <div className="bg-white rounded-4 border overflow-hidden shadow-sm sticky-top" style={{ top: 90 }}>
              <img
                src={tractorImg}
                alt={tractor.name}
                className="w-100"
                style={{ height: 180, objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = defaultImg;
                }}
              />

              <div className="p-3.5">
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <Badge variant="primary" size="sm">{tractor.brand}</Badge>
                  <div className="d-flex align-items-center gap-1 text-warning fw-bold small">
                    <FaStar /> {tractor.avg_rating || "4.8"}
                  </div>
                </div>

                <h5 className="fw-bold text-dark mb-1 font-heading">{tractor.name}</h5>
                <p className="text-muted small mb-3 d-flex align-items-center gap-1">
                  <FaMapMarkerAlt className="text-danger flex-shrink-0" />
                  <span className="text-truncate">{tractor.location}</span>
                </p>

                {/* Configuration Breakdown */}
                <div className="p-3 bg-light rounded-3 border mb-3 small">
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-muted">Work Purpose:</span>
                    <span className="fw-semibold text-dark text-capitalize">{farmingWorkType}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-muted">Rental Schedule:</span>
                    <span className="fw-semibold text-dark">
                      {durationMode === "daily" ? `${daysCount} Day(s) [${startDate} to ${endDate}]` : `${hourlyUnits} Hour(s) on ${startDate}`}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-muted">Rate ({durationMode}):</span>
                    <span className="fw-semibold text-dark">
                      {durationMode === "daily" ? `₹${tractor.rent_per_day} / day` : `₹${tractor.rent_per_hour} / hr`}
                    </span>
                  </div>
                  {implementsTotal > 0 && (
                    <div className="d-flex justify-content-between mb-1.5 text-success">
                      <span>Attachment Addon:</span>
                      <span className="fw-bold">+₹{implementsTotal}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-baseline">
                    <span className="fw-bold text-dark fs-6">Estimated Total:</span>
                    <span className="fs-3 fw-extrabold text-success font-heading">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="small text-muted d-flex align-items-center gap-2">
                  <FaInfoCircle className="text-success flex-shrink-0" />
                  <span>No payment required now. Pay online or in cash upon field delivery.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookTractor;