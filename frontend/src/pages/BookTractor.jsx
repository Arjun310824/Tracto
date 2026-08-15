import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaTractor, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, FaStar, FaCogs } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function BookTractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

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
        (b) => (b.tractor === parseInt(id) || b.tractor_details?.id === parseInt(id)) && ["pending", "approved", "paid"].includes(b.status)
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
      setSelectedImplementIds(selectedImplementIds.filter((i) => i !== implId));
    } else {
      setSelectedImplementIds([...selectedImplementIds, implId]);
    }
  };

  // Recalculate total amount and check date availability on changes
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

    // Check overlap with existing active bookings
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
      setError("This tractor is not available for this particular date or time.");
    } else {
      setIsDateUnavailable(false);
      setError("");
    }

    const baseRate = durationMode === "daily" ? parseFloat(tractor.rent_per_day) : parseFloat(tractor.rent_per_hour);
    const baseTotal = baseRate * units;

    let implAddonFee = 0;
    implementsList.forEach((impl) => {
      if (selectedImplementIds.includes(impl.id)) {
        const implRate = durationMode === "daily" ? parseFloat(impl.rent_per_day) : parseFloat(impl.rent_per_hour);
        implAddonFee += implRate * units;
      }
    });

    setImplementsTotal(implAddonFee);
    setTotalAmount(baseTotal + implAddonFee);
  }, [startDate, endDate, durationMode, hourlyUnits, tractor, selectedImplementIds, implementsList, existingBookings]);


  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("bookings/", {
        tractor: tractor.id,
        selected_implements: selectedImplementIds,
        start_date: startDate,
        end_date: durationMode === "daily" ? endDate : startDate,
        rental_duration_type: durationMode,
        rental_units: durationMode === "daily" ? daysCount : hourlyUnits,
        purpose,
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
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      </div>
    );
  }

  if (!tractor) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="alert alert-danger">{error || "Tractor not found."}</div>
          <Link to="/tractors" className="btn btn-success rounded-pill px-4">Back to Tractors</Link>
        </div>
      </div>
    );
  }

  const defaultImg = "http://127.0.0.1:8000/media/tractors/mahindra_gen.png";

  const tractorImg = tractor.image ? (tractor.image.startsWith("http") ? tractor.image : `http://127.0.0.1:8000${tractor.image}`) : defaultImg;

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4" style={{ maxWidth: 960 }}>
        <h2 className="fw-extrabold text-dark mb-4">Book Tractor - {tractor.name}</h2>

        {error && <div className="alert alert-danger p-3 mb-4 rounded-3 d-flex align-items-center gap-2"><FaExclamationTriangle /> {error}</div>}

        <div className="row g-4">
          {/* Tractor Summary Card */}
          <div className="col-md-5">
            <div className="card glass-card border-0 overflow-hidden sticky-top" style={{ top: 80 }}>
              <img src={tractorImg} className="card-img-top" alt={tractor.name} style={{ height: 200, objectFit: "cover" }} />
              <div className="card-body p-3.5">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-success-subtle text-success fw-bold">{tractor.brand}</span>
                  <span className="text-warning fw-bold small"><FaStar /> {tractor.avg_rating || "4.8"}</span>
                </div>
                <h5 className="fw-bold text-dark">{tractor.name}</h5>
                <p className="text-muted small mb-3"><FaMapMarkerAlt className="text-danger" /> {tractor.location}</p>

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Horsepower:</span>
                    <span className="fw-semibold small">{tractor.horsepower} HP</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Daily Rate:</span>
                    <span className="fw-bold text-success">₹{tractor.rent_per_day} / day</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Hourly Rate:</span>
                    <span className="fw-semibold text-dark">₹{tractor.rent_per_hour} / hr</span>
                  </div>
                </div>

                <div className="small text-secondary">
                  <strong>Owner:</strong> {tractor.owner_details?.first_name || "Ramesh Patel"} ({tractor.owner_details?.phone || "N/A"})
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="col-md-7">
            <div className="card glass-card border-0 p-4">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Booking Details</h5>

              <form onSubmit={handleSubmitBooking}>
                {/* Rental Type Selector */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small">Rental Duration Type</label>
                  <div className="d-flex gap-3">
                    <div className={`flex-fill p-3 text-center rounded-3 border cursor-pointer ${durationMode === "daily" ? "border-success bg-success-subtle text-success font-weight-bold" : "bg-light text-muted"}`} onClick={() => setDurationMode("daily")} style={{ cursor: "pointer" }}>
                      <FaCalendarAlt className="fs-5 mb-1 d-block mx-auto" /> Daily Rent
                    </div>
                    <div className={`flex-fill p-3 text-center rounded-3 border cursor-pointer ${durationMode === "hourly" ? "border-success bg-success-subtle text-success font-weight-bold" : "bg-light text-muted"}`} onClick={() => setDurationMode("hourly")} style={{ cursor: "pointer" }}>
                      <FaClock className="fs-5 mb-1 d-block mx-auto" /> Hourly Rent
                    </div>
                  </div>
                </div>

                {durationMode === "daily" ? (
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label fw-semibold text-muted small">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold text-muted small">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label fw-semibold text-muted small">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold text-muted small">Hours Required</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="24"
                        value={hourlyUnits}
                        onChange={(e) => setHourlyUnits(parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Implement & Attachment Add-ons */}
                {implementsList.length > 0 && (
                  <div className="mb-4 bg-light p-3 rounded-3 border">
                    <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-2">
                      <FaCogs className="text-success" /> Select Equipment / Implement Attachments (Optional Add-ons)
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {implementsList.map((impl) => {
                        const isChecked = selectedImplementIds.includes(impl.id);
                        const rateStr = durationMode === "daily" ? `+₹${impl.rent_per_day}/day` : `+₹${impl.rent_per_hour}/hr`;
                        return (
                          <div
                            key={impl.id}
                            className={`p-2.5 rounded border d-flex justify-content-between align-items-center cursor-pointer ${isChecked ? "bg-success-subtle border-success" : "bg-white"}`}
                            onClick={() => handleToggleImplement(impl.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={isChecked}
                                onChange={() => handleToggleImplement(impl.id)}
                              />
                              <div>
                                <div className="fw-bold text-dark small">{impl.name}</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{impl.description}</div>
                              </div>
                            </div>
                            <span className="badge bg-success text-white fw-semibold">{rateStr}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery & Dispatch Options (Uber / Rapido Style) */}
                <div className="mb-3 bg-light p-3 rounded-3 border">
                  <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-1.5">
                    <FaMapMarkerAlt className="text-danger" /> Pickup / Farm Location (Dispatch Destination)
                  </label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter your Farm / Village address (e.g. Survey No. 42, Dholka, Ahmedabad)"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />

                  <label className="form-label fw-semibold text-muted small mb-1">Delivery / Dispatch Preference</label>
                  <select className="form-select form-select-sm" defaultValue="owner_delivers">
                    <option value="owner_delivers">🚜 Owner / Driver Delivers Tractor to My Farm</option>
                    <option value="customer_pickup">🔑 Self Pickup from Owner Yard</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small">Special Requests / Notes to Owner</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Mention delivery preference or additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>


                {/* Price Calculation Summary */}
                <div className="bg-success-subtle p-3 rounded-3 mb-4 border border-success-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary small">Tractor Rate ({durationMode}):</span>
                    <span className="fw-semibold text-dark">
                      {durationMode === "daily" ? `₹${tractor.rent_per_day} × ${daysCount} Days` : `₹${tractor.rent_per_hour} × ${hourlyUnits} Hours`}
                    </span>
                  </div>
                  {implementsTotal > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary small">Implements Add-on Fee:</span>
                      <span className="fw-semibold text-success">+₹{implementsTotal}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top border-success-subtle">
                    <span className="fw-bold text-dark fs-6">Total Rental Amount:</span>
                    <span className="fs-3 fw-extrabold text-success">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn w-100 py-3 rounded-pill fw-bold fs-6 ${isDateUnavailable ? "btn-secondary cursor-not-allowed" : "btn-tracto-primary"}`}
                  disabled={submitting || isDateUnavailable}
                >
                  {submitting ? "Sending Request..." : isDateUnavailable ? "⚠️ Tractor Not Available For Selected Dates" : "Send Booking Request"}
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookTractor;