import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBookmark, FaCreditCard, FaFileInvoice, FaStar, FaTimesCircle, FaTractor, FaCalendarAlt, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, FaUser } from "react-icons/fa";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PaymentModal from "../components/PaymentModal";
import ReviewModal from "../components/ReviewModal";
import LiveDispatchTracker from "../components/LiveDispatchTracker";


function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("bookings/");
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;

    try {
      await api.post(`bookings/${bookingId}/cancel/`);
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(err.response?.data?.error || "Failed to cancel booking.");
    }
  };

  const handleResendOtp = async (bookingId) => {
    try {
      const res = await api.post(`bookings/${bookingId}/resend-otp/`);
      alert(`📲 ${res.data.message}`);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, completion_otp: res.data.completion_otp } : b)));
    } catch (err) {
      console.error("Error resending OTP:", err);
      alert("Failed to resend SMS OTP.");
    }
  };


  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-pending">PENDING APPROVAL</span>;
      case "approved":
        return <span className="badge badge-approved">APPROVED (PAYMENT REQUIRED)</span>;
      case "paid":
        return <span className="badge badge-paid">PAID & CONFIRMED</span>;
      case "completed":
        return <span className="badge badge-completed">COMPLETED</span>;
      case "rejected":
        return <span className="badge badge-rejected">REJECTED</span>;
      case "cancelled":
        return <span className="badge badge-cancelled">CANCELLED</span>;
      default:
        return <span className="badge bg-secondary">{status.toUpperCase()}</span>;
    }
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
                <h2 className="fw-extrabold text-dark m-0">My Bookings</h2>
                <p className="text-muted small">Track and manage your tractor rental requests</p>
              </div>
              <Link to="/tractors" className="btn btn-tracto-primary rounded-pill px-4 btn-sm">
                Book Another Tractor
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3">
              {["all", "pending", "approved", "paid", "completed", "rejected", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm rounded-pill text-capitalize px-3 ${activeTab === tab ? "btn-success fw-bold" : "btn-outline-secondary"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaBookmark className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Bookings Found</h5>
                <p className="text-muted small">You don't have any bookings in this category yet.</p>
                <Link to="/tractors" className="btn btn-outline-success btn-sm rounded-pill px-4">
                  Browse Tractors
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="glass-card p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
                      <div>
                        <div className="text-muted small fw-bold mb-1">
                          REF: TRC{b.id.toString().padStart(5, "0")} • Requested on {new Date(b.created_at).toLocaleDateString()}
                        </div>
                        <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                          <FaTractor className="text-success" />
                          {b.tractor_details?.name || "Tractor"}
                        </h4>

                        <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                          <span className="badge bg-primary text-white rounded-pill px-3 py-1.5 fw-bold">
                            {b.farming_work_type === "transport" ? "🚛 Crop Transport / Trolley" :
                             b.farming_work_type === "rotavator" ? "🔄 Fine Soil Rotavator" :
                             b.farming_work_type === "sowing" ? "🌱 Crop Sowing / Seeding" :
                             b.farming_work_type === "harvesting" ? "🚜 Threshing / Harvesting" :
                             b.farming_work_type === "leveling" ? "📐 Laser Land Leveling" :
                             "🌾 Land Plowing / Tillage"}
                          </span>
                          {b.crop_name && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                              🌱 {b.crop_name}
                            </span>
                          )}
                          {b.purpose && (
                            <span className="text-muted small">
                              📍 {b.purpose}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>{getStatusBadge(b.status)}</div>
                    </div>


                    {/* Visual Uber/Rapido-Style Trip Progress Flow Bar */}
                    <div className="bg-light p-3 rounded-3 mb-3 border">
                      <div className="d-flex align-items-center justify-content-between text-center small gap-1">
                        <div className="flex-fill">
                          <span className={`badge ${b.status !== 'rejected' && b.status !== 'cancelled' ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1`}>
                            1. Request Sent
                          </span>
                        </div>
                        <div className="text-muted fw-bold">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${['approved', 'arrived', 'in_progress', 'paid', 'completed'].includes(b.status) ? 'bg-success' : 'bg-light text-muted border'} rounded-pill px-2 py-1`}>
                            2. Accepted
                          </span>
                        </div>
                        <div className="text-muted fw-bold">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${['arrived', 'in_progress', 'completed'].includes(b.status) ? 'bg-success' : 'bg-light text-muted border'} rounded-pill px-2 py-1`}>
                            3. On Site 🌾
                          </span>
                        </div>
                        <div className="text-muted fw-bold">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${['in_progress', 'completed'].includes(b.status) ? 'bg-success' : 'bg-light text-muted border'} rounded-pill px-2 py-1`}>
                            4. In Progress ⏱️
                          </span>
                        </div>
                        <div className="text-muted fw-bold">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${b.status === 'completed' ? 'bg-success' : 'bg-light text-muted border'} rounded-pill px-2 py-1`}>
                            5. Completed ⭐
                          </span>
                        </div>
                      </div>
                    </div>

                    {['approved', 'arrived', 'in_progress', 'paid'].includes(b.status) && (
                      <div className="bg-warning-subtle p-3 rounded-4 border border-warning mb-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-warning text-dark p-2.5 rounded-circle fs-4">🔒</div>
                          <div>
                            <div className="fw-bold text-dark fs-6 d-flex align-items-center flex-wrap gap-2">
                              Farmer Work Completion OTP:
                              <span className="fs-4 text-danger font-monospace border border-danger bg-white px-2.5 py-0.5 rounded-3 fw-extrabold shadow-sm">
                                {b.completion_otp || "4892"}
                              </span>
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
                                📱 SMS Sent to Phone
                              </span>
                            </div>
                            <div className="text-muted small mt-1">
                              {b.status === "paid" ? "✅ Payment Confirmed by Owner! " : ""}
                              Give this 4-digit SMS OTP to the tractor owner/driver ONLY after all your farm work is completely finished.
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-outline-warning text-dark btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap"
                            onClick={() => handleResendOtp(b.id)}
                            title="Resend SMS OTP to your registered phone number"
                          >
                            🔄 Resend SMS OTP
                          </button>
                          <span className="badge bg-danger text-white rounded-pill px-3 py-2 fw-bold text-uppercase">
                            {b.status === "paid" ? "Payment Received" : "Give at Finish"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Live Driver GPS Dispatch Tracker */}

                    {['approved', 'arrived', 'in_progress', 'paid'].includes(b.status) && (
                      <LiveDispatchTracker
                        booking={b}
                        driverName={b.tractor_details?.owner_details?.first_name ? `${b.tractor_details.owner_details.first_name} ${b.tractor_details.owner_details.last_name || ''}` : "Ramesh Patel"}
                        driverPhone={b.tractor_details?.owner_details?.phone || "+91 98765 43210"}
                      />
                    )}

                    {/* Tractor Owner & Driver Contact Info Card */}
                    <div className="bg-light p-3 rounded-4 border border-secondary-subtle mb-3">

                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-success text-white p-2 rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <FaUser />
                          </div>
                          <div>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Tractor Owner & Driver Contact:</div>
                            <div className="fw-bold text-dark fs-6">
                              {b.tractor_details?.owner_details?.first_name ? `${b.tractor_details.owner_details.first_name} ${b.tractor_details.owner_details.last_name || ''}` : "Ramesh Patel (Owner)"}
                            </div>
                            <div className="text-muted small d-flex align-items-center gap-1">
                              <FaMapMarkerAlt className="text-danger" /> {b.tractor_details?.location || "Sanand"}, {b.tractor_details?.district || "Ahmedabad"}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <a
                            href={`tel:${b.tractor_details?.owner_details?.phone || "+919876543210"}`}
                            className="btn btn-outline-success btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm text-decoration-none"
                          >
                            <FaPhoneAlt /> Call: {b.tractor_details?.owner_details?.phone || "+91 98765 43210"}
                          </a>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${(b.tractor_details?.owner_details?.phone || "919876543210").replace(/[^0-9]/g, "")}&text=${encodeURIComponent(`Hello ${b.tractor_details?.owner_details?.first_name || 'Owner'}, I have booked your tractor ${b.tractor_details?.name} (REF: TRC${b.id.toString().padStart(5, "0")}) on TRACTO.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm text-decoration-none"
                          >
                            <FaWhatsapp className="fs-6" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 align-items-center">

                      <div className="col-md-4">
                        <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                          <FaCalendarAlt className="text-primary" /> Duration:
                        </div>
                        <div className="fw-semibold text-dark">
                          {b.start_date} to {b.end_date} ({b.rental_units} {b.rental_duration_type === "hourly" ? "Hours" : "Days"})
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="text-muted small mb-1">Total Rental Amount:</div>
                        <div className="fs-4 fw-extrabold text-success">₹{b.total_amount}</div>
                      </div>

                      <div className="col-md-5 d-flex flex-wrap justify-content-md-end gap-2">
                        {/* Action Buttons */}
                        {b.status === "approved" && (
                          <button
                            className="btn btn-success btn-sm rounded-pill px-3.5 py-1.5 fw-bold d-flex align-items-center gap-1.5"
                            onClick={() => setSelectedPaymentBooking(b)}
                          >
                            <FaCreditCard /> Pay ₹{b.total_amount} Now
                          </button>
                        )}

                        {(b.status === "paid" || b.status === "completed") && (
                          <Link
                            to={`/invoice/${b.id}`}
                            target="_blank"
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
                          >
                            <FaFileInvoice /> Invoice
                          </Link>
                        )}

                        {(b.status === "paid" || b.status === "completed") && (
                          b.review ? (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle fw-bold px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                              <FaStar className="text-warning" /> Reviewed ({b.review.rating}★)
                            </span>
                          ) : (
                            <button
                              className="btn btn-warning text-dark btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                              onClick={() => setSelectedReviewBooking(b)}
                            >
                              <FaStar /> Rate & Review
                            </button>
                          )
                        )}


                        {(b.status === "pending" || b.status === "approved") && (
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            <FaTimesCircle /> Cancel Request
                          </button>
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

      {/* Payment Modal */}
      {selectedPaymentBooking && (
        <PaymentModal
          booking={selectedPaymentBooking}
          onClose={() => setSelectedPaymentBooking(null)}
          onSuccess={fetchBookings}
        />
      )}

      {/* Review Modal */}
      {selectedReviewBooking && (
        <ReviewModal
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
}

export default MyBookings;