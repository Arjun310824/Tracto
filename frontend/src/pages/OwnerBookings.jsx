import { useState, useEffect } from "react";
import { FaBookmark, FaCheck, FaTimes, FaCheckDouble, FaUser, FaPhone, FaCalendarAlt, FaTractor, FaMapMarkerAlt, FaPlay, FaTruck, FaTachometerAlt, FaSave } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");
  const [meterInputs, setMeterInputs] = useState({});
  const [savingMeterId, setSavingMeterId] = useState(null);

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("bookings/");
      const data = res.data.results || res.data || [];
      setBookings(data);

      // Initialize meter inputs state
      const initialMeters = {};
      data.forEach((b) => {
        initialMeters[b.id] = {
          start: b.start_meter_hours || 0,
          end: b.end_meter_hours || 0,
        };
      });
      setMeterInputs(initialMeters);
    } catch (err) {
      console.error("Error loading owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTripStatus = async (bookingId, newStatus) => {
    try {
      await api.post(`bookings/${bookingId}/update-status/`, { status: newStatus });
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
    } catch (err) {
      console.error("Error updating trip status:", err);
      alert("Failed to update trip status.");
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await api.post(`bookings/${bookingId}/approve/`);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "approved" } : b)));
    } catch (err) {
      console.error("Error approving booking:", err);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await api.post(`bookings/${bookingId}/reject/`);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "rejected" } : b)));
    } catch (err) {
      console.error("Error rejecting booking:", err);
    }
  };

  const handleSaveMeterReading = async (bookingId) => {
    const meters = meterInputs[bookingId];
    if (!meters) return;

    setSavingMeterId(bookingId);
    try {
      await api.post(`bookings/${bookingId}/update-meter/`, {
        start_meter_hours: meters.start,
        end_meter_hours: meters.end,
      });
      alert("Tractor engine meter reading updated!");
      fetchOwnerBookings();
    } catch (err) {
      console.error("Error saving meter readings:", err);
      alert("Failed to update meter readings.");
    } finally {
      setSavingMeterId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === "pending") return b.status === "pending";
    if (filterTab === "approved") return ["approved", "arrived", "in_progress", "paid"].includes(b.status);
    if (filterTab === "completed") return b.status === "completed";
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-warning text-dark",
      approved: "bg-primary",
      arrived: "bg-info text-white",
      in_progress: "bg-success text-white",
      paid: "bg-success",
      completed: "bg-success",
      rejected: "bg-danger",
      cancelled: "bg-secondary",
    };
    return <span className={`badge rounded-pill text-uppercase px-3 py-1.5 ${badges[status] || "bg-secondary"}`}>{status}</span>;
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-xl-10 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                  <FaBookmark className="text-success" /> Live On-Demand Rental Dispatch & Meter Tracker
                </h2>
                <p className="text-muted small">Manage customer rental requests, dispatch driver/tractor to field, and record engine meter hours</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="btn-group rounded-pill p-1 bg-white border">
                {["all", "pending", "approved", "completed"].map((tab) => (
                  <button
                    key={tab}
                    className={`btn btn-sm rounded-pill text-capitalize fw-bold px-3 ${filterTab === tab ? "btn-success" : "btn-light text-muted"}`}
                    onClick={() => setFilterTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaBookmark className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Booking Requests</h5>
                <p className="text-muted small">Customer rental requests for your tractors will appear here.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredBookings.map((b) => {
                  const mInput = meterInputs[b.id] || { start: 0, end: 0 };
                  const netMeterHours = Math.max(0, (mInput.end - mInput.start).toFixed(1));

                  return (
                    <div key={b.id} className="glass-card p-4">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
                        <div>
                          <div className="text-muted small fw-bold mb-1">
                            REF: TRC{b.id.toString().padStart(5, "0")} • {b.tractor_details?.brand || "Brand"}
                          </div>
                          <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                            <FaTractor className="text-success" />
                            {b.tractor_details?.name || "Tractor"}
                          </h4>
                        </div>

                        <div>{getStatusBadge(b.status)}</div>
                      </div>

                      <div className="row g-3 align-items-center mb-3">
                        <div className="col-md-3">
                          <div className="small text-muted mb-1"><FaUser className="text-success" /> Customer Info:</div>
                          <div className="fw-bold text-dark">{b.customer_details?.first_name} {b.customer_details?.last_name}</div>
                          <div className="small text-secondary"><FaPhone className="text-primary" /> {b.customer_details?.phone || b.customer_details?.email}</div>
                        </div>

                        <div className="col-md-3">
                          <div className="small text-muted mb-1"><FaCalendarAlt className="text-primary" /> Dates & Field Purpose:</div>
                          <div className="fw-semibold text-dark">{b.start_date} to {b.end_date}</div>
                          <div className="small text-muted">{b.rental_units} {b.rental_duration_type === "hourly" ? "Hours" : "Days"} • {b.purpose || 'Farming Work'}</div>
                        </div>

                        <div className="col-md-2">
                          <div className="small text-muted mb-1">Total Amount:</div>
                          <div className="fs-4 fw-extrabold text-success">₹{b.total_amount}</div>
                        </div>

                        {/* Live Driver Dispatch Actions */}
                        <div className="col-md-4 d-flex flex-column gap-2 justify-content-center">
                          {b.status === "pending" && (
                            <div className="d-flex gap-2">
                              <button className="btn btn-success btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1 fw-bold" onClick={() => handleApprove(b.id)}>
                                <FaCheck /> Accept Ride
                              </button>
                              <button className="btn btn-outline-danger btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1" onClick={() => handleReject(b.id)}>
                                <FaTimes /> Decline
                              </button>
                            </div>
                          )}

                          {b.status === "approved" && (
                            <button className="btn btn-info text-white btn-sm rounded-pill d-flex align-items-center justify-content-center gap-1.5 fw-bold" onClick={() => handleUpdateTripStatus(b.id, "arrived")}>
                              <FaTruck /> Arrived on Field 🌾
                            </button>
                          )}

                          {b.status === "arrived" && (
                            <button className="btn btn-warning text-dark btn-sm rounded-pill d-flex align-items-center justify-content-center gap-1.5 fw-bold" onClick={() => handleUpdateTripStatus(b.id, "in_progress")}>
                              <FaPlay /> Start Farming Work ⏱️
                            </button>
                          )}

                          {(b.status === "in_progress" || b.status === "paid") && (
                            <button className="btn btn-success btn-sm rounded-pill d-flex align-items-center justify-content-center gap-1.5 fw-bold" onClick={() => handleUpdateTripStatus(b.id, "completed")}>
                              <FaCheckDouble /> Mark Work Completed ⭐
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Engine Hour Meter Tracker (Feature #5) */}
                      <div className="bg-light p-3 rounded-4 border border-secondary-subtle">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                            <FaTachometerAlt className="text-warning" /> Tractor Engine Hour Meter Counter (કલાક મીટર રીડિંગ)
                          </span>
                          <span className="badge bg-success text-white fw-bold">
                            Net Hours: {netMeterHours} hrs
                          </span>
                        </div>

                        <div className="row g-2 align-items-center">
                          <div className="col-5 col-sm-4">
                            <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Start Meter (કલાક)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm rounded-3"
                              value={mInput.start}
                              onChange={(e) => setMeterInputs({
                                ...meterInputs,
                                [b.id]: { ...mInput, start: parseFloat(e.target.value) || 0 }
                              })}
                            />
                          </div>

                          <div className="col-5 col-sm-4">
                            <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>End Meter (કલાક)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm rounded-3"
                              value={mInput.end}
                              onChange={(e) => setMeterInputs({
                                ...meterInputs,
                                [b.id]: { ...mInput, end: parseFloat(e.target.value) || 0 }
                              })}
                            />
                          </div>

                          <div className="col-2 col-sm-4 mt-auto">
                            <button
                              className="btn btn-dark btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1 fw-bold"
                              onClick={() => handleSaveMeterReading(b.id)}
                              disabled={savingMeterId === b.id}
                            >
                              <FaSave /> {savingMeterId === b.id ? "..." : "Save Meter"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerBookings;