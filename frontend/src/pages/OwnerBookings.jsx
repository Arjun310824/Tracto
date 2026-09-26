import { useState, useEffect } from "react";
import {
  FaBookmark,
  FaCheck,
  FaTimes,
  FaCheckDouble,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaTractor,
  FaMapMarkerAlt,
  FaTruck,
  FaTachometerAlt,
  FaLock,
  FaMoneyBillWave,
  FaBroadcastTower,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");
  const [otpInputs, setOtpInputs] = useState({});
  const [verifyingOtpId, setVerifyingOtpId] = useState(null);

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("bookings/owner-requests/");
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await api.post(`bookings/${bookingId}/approve/`);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "approved" } : b)));
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Failed to approve booking.");
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Are you sure you want to decline this booking request?")) return;
    try {
      await api.post(`bookings/${bookingId}/reject/`);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "rejected" } : b)));
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert("Failed to decline booking.");
    }
  };

  const handleConfirmPayment = async (bookingId) => {
    try {
      const res = await api.post(`bookings/${bookingId}/confirm-payment/`);
      alert("✅ " + res.data.message);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "paid" } : b)));
    } catch (err) {
      console.error("Payment confirmation error:", err);
      alert(err.response?.data?.error || "Failed to confirm payment.");
    }
  };

  const handleVerifyOtp = async (bookingId) => {
    const otpCode = otpInputs[bookingId] || "";
    if (!otpCode || otpCode.length < 4) {
      alert("Please enter the 4-digit Completion OTP provided by the farmer.");
      return;
    }
    setVerifyingOtpId(bookingId);
    try {
      const res = await api.post(`bookings/${bookingId}/verify-completion-otp/`, { otp: otpCode });
      alert("✅ " + res.data.message);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)));
    } catch (err) {
      console.error("OTP verification error:", err);
      alert(err.response?.data?.error || "Invalid OTP entered.");
    } finally {
      setVerifyingOtpId(null);
    }
  };

  const handleBroadcastDriverLocation = (bookingId) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post(`bookings/${bookingId}/update-driver-location/`, {
              latitude,
              longitude,
            });
            alert(
              `📡 Real GPS Location broadcasted to farmer! (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})`
            );
            fetchOwnerBookings();
          } catch (err) {
            console.error("Location update error:", err);
          }
        },
        () => {
          alert("📍 Location permission required to broadcast live driver GPS.");
        }
      );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === "all") return true;
    return b.status === filterTab;
  });

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Responsive Sidebar for Mobile & Desktop */}
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            <div className="mb-4">
              <h1 className="h3 fw-extrabold text-dark m-0 font-heading">Booking Requests & Dispatches</h1>
              <p className="text-muted small m-0 mt-0.5">
                Review rental requests, verify farmer completion OTPs, and confirm payouts
              </p>
            </div>

            {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
            <div className="d-flex gap-2 mb-4 pb-2 border-bottom overflow-auto text-nowrap">
              {["all", "pending", "approved", "paid", "completed", "rejected"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm rounded-pill text-capitalize px-3 py-1.5 fw-semibold transition-all ${
                    filterTab === tab
                      ? "btn-success text-white shadow-sm"
                      : "btn-outline-secondary bg-white text-secondary"
                  }`}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab}
                  {tab !== "all" && (
                    <span className="ms-1.5 opacity-75">
                      ({bookings.filter((b) => b.status === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
                <p className="text-muted small mt-3">Loading booking requests...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 shadow-sm my-2">
                <EmptyState
                  icon={<FaBookmark />}
                  title="No Requests in this Filter"
                  description="There are no farmer requests currently under this category."
                />
              </div>
            ) : (
              <div className="d-flex flex-column gap-3.5">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-4 border p-4 shadow-sm">
                    {/* Header */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 border-bottom pb-3 mb-3">
                      <div>
                        <div className="text-muted small fw-bold font-monospace mb-1">
                          REF: TRC{b.id.toString().padStart(5, "0")} • Booked on {new Date(b.created_at).toLocaleDateString()}
                        </div>
                        <h4 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2 font-heading">
                          <FaTractor className="text-success" />
                          <span>{b.tractor_details?.name || "Tractor"}</span>
                        </h4>
                        <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                          <Badge variant="primary" size="sm">
                            {b.farming_work_type || "Farming Work"}
                          </Badge>
                          {b.crop_name && (
                            <Badge variant="neutral" size="sm">
                              🌱 {b.crop_name}
                            </Badge>
                          )}
                          {b.purpose && (
                            <span className="text-muted small d-flex align-items-center gap-1">
                              <FaMapMarkerAlt className="text-danger" /> {b.purpose}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <Badge variant={b.status} size="md">
                          {b.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer & Location Details Card */}
                    <div className="p-3 bg-light rounded-3 border mb-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle p-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                            style={{ width: 40, height: 40, background: "var(--primary-600)" }}
                          >
                            <FaUser />
                          </div>
                          <div>
                            <span className="text-muted small d-block" style={{ fontSize: "0.75rem" }}>Renting Farmer:</span>
                            <strong className="text-dark fs-6">
                              {b.customer_details?.first_name || "Farmer"} {b.customer_details?.last_name || ""}
                            </strong>
                            <div className="text-muted small">
                              Phone: <a href={`tel:${b.customer_details?.phone || ""}`} className="text-success text-decoration-none fw-semibold">{b.customer_details?.phone || "N/A"}</a> • Email: {b.customer_details?.email}
                            </div>
                          </div>
                        </div>

                        <div className="text-md-end">
                          <span className="text-muted small d-block">Scheduled Rental Period:</span>
                          <span className="fw-semibold text-dark small">
                            {b.start_date} to {b.end_date} ({b.rental_units} {b.rental_duration_type === "hourly" ? "Hours" : "Days"})
                          </span>
                          <div className="fs-5 fw-extrabold text-success font-monospace font-heading mt-0.5">
                            Total: ₹{b.total_amount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OTP Completion Verification Input (When Active/Paid) */}
                    {["approved", "arrived", "in_progress", "paid"].includes(b.status) && (
                      <div className="p-3.5 rounded-3 bg-warning-subtle text-dark border border-warning mb-3">
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                          <div>
                            <div className="fw-bold d-flex align-items-center gap-2 font-heading fs-6">
                              <FaLock className="text-danger" /> Enter Farmer's 4-Digit Completion OTP:
                            </div>
                            <small className="text-muted">
                              Ask the farmer for the secret 4-digit code displayed on their dashboard when the job is done.
                            </small>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="text"
                              maxLength="4"
                              placeholder="4-digit OTP"
                              className="tracto-input text-center fw-bold font-monospace bg-white"
                              style={{ width: 120, minHeight: 38 }}
                              value={otpInputs[b.id] || ""}
                              onChange={(e) => setOtpInputs({ ...otpInputs, [b.id]: e.target.value })}
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={verifyingOtpId === b.id}
                              loadingText="Verifying..."
                              onClick={() => handleVerifyOtp(b.id)}
                            >
                              Verify & Finish Job
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Controls */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                      <div className="d-flex align-items-center gap-2">
                        {["approved", "arrived", "in_progress"].includes(b.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBroadcastDriverLocation(b.id)}
                            icon={<FaBroadcastTower className="text-primary" />}
                          >
                            Broadcast Live GPS to Farmer
                          </Button>
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {b.status === "pending" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(b.id)}
                              icon={<FaCheck />}
                            >
                              Approve Request
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(b.id)}
                              icon={<FaTimes className="text-danger" />}
                              className="border-danger text-danger"
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {b.status === "approved" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleConfirmPayment(b.id)}
                            icon={<FaMoneyBillWave />}
                          >
                            Confirm Received Cash (₹{b.total_amount})
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerBookings;