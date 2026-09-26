import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookmark,
  FaCreditCard,
  FaFileInvoice,
  FaStar,
  FaTimesCircle,
  FaTractor,
  FaCalendarAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaUser,
  FaRedo,
  FaSearch,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PaymentModal from "../components/PaymentModal";
import ReviewModal from "../components/ReviewModal";
import LiveDispatchTracker from "../components/LiveDispatchTracker";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

function MyBookings() {
  const navigate = useNavigate();
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
      alert("✅ " + res.data.message);
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, completion_otp: res.data.completion_otp } : b))
      );
    } catch (err) {
      console.error("Error generating fresh OTP:", err);
      alert("Failed to refresh OTP.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
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
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading">My Rental Bookings</h1>
                <p className="text-muted small m-0 mt-0.5">Track, pay for, and manage your tractor rental requests</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate("/tractors")} icon={<FaSearch />}>
                Book Another Tractor
              </Button>
            </div>

            {/* Responsive Filter Tabs (scrollable on mobile) */}
            <div className="d-flex gap-2 mb-4 pb-2 border-bottom overflow-auto text-nowrap">
              {["all", "pending", "approved", "paid", "completed", "rejected", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm rounded-pill text-capitalize px-3 py-1.5 fw-semibold transition-all ${
                    activeTab === tab
                      ? "btn-success text-white shadow-sm"
                      : "btn-outline-secondary bg-white text-secondary"
                  }`}
                  onClick={() => setActiveTab(tab)}
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
                <p className="text-muted small mt-3">Loading booking records...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 shadow-sm my-2">
                <EmptyState
                  icon={<FaBookmark />}
                  title="No Bookings in this Category"
                  description="You don't have any bookings matching this status filter."
                  action={
                    <Button variant="primary" size="sm" onClick={() => navigate("/tractors")} icon={<FaSearch />}>
                      Explore Available Tractors
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="d-flex flex-column gap-3.5">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-4 border p-4 shadow-sm">
                    {/* Top Row: Ref, Tractor & Status */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 border-bottom pb-3 mb-3">
                      <div>
                        <div className="text-muted small fw-bold font-monospace mb-1">
                          REF: TRC{b.id.toString().padStart(5, "0")} • Requested on {new Date(b.created_at).toLocaleDateString()}
                        </div>
                        <h4 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2 font-heading">
                          <FaTractor className="text-success" />
                          <span>{b.tractor_details?.name || "Tractor"}</span>
                        </h4>

                        <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                          <Badge variant="primary" size="sm">
                            {b.farming_work_type === "transport"
                              ? "🚛 Crop Transport / Trolley"
                              : b.farming_work_type === "rotavator"
                              ? "🔄 Soil Rotavator"
                              : b.farming_work_type === "sowing"
                              ? "🌱 Crop Sowing"
                              : b.farming_work_type === "harvesting"
                              ? "🚜 Harvesting"
                              : b.farming_work_type === "leveling"
                              ? "📐 Land Leveling"
                              : "🌾 Land Plowing"}
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
                          {b.status === "approved" ? "APPROVED - AWAITING PAYMENT" : b.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Step Progress Tracker */}
                    <div className="p-3 bg-light rounded-3 mb-3 border">
                      <div className="d-flex align-items-center justify-content-between text-center small gap-1 flex-wrap flex-sm-nowrap">
                        <div className="flex-fill">
                          <span className={`badge ${b.status !== "rejected" && b.status !== "cancelled" ? "bg-success" : "bg-secondary"} rounded-pill px-2 py-1`}>
                            1. Requested
                          </span>
                        </div>
                        <div className="text-muted fw-bold d-none d-sm-inline">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${["approved", "arrived", "in_progress", "paid", "completed"].includes(b.status) ? "bg-success" : "bg-light text-muted border"} rounded-pill px-2 py-1`}>
                            2. Accepted
                          </span>
                        </div>
                        <div className="text-muted fw-bold d-none d-sm-inline">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${["arrived", "in_progress", "completed"].includes(b.status) ? "bg-success" : "bg-light text-muted border"} rounded-pill px-2 py-1`}>
                            3. On Site
                          </span>
                        </div>
                        <div className="text-muted fw-bold d-none d-sm-inline">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${["in_progress", "completed"].includes(b.status) ? "bg-success" : "bg-light text-muted border"} rounded-pill px-2 py-1`}>
                            4. In Progress
                          </span>
                        </div>
                        <div className="text-muted fw-bold d-none d-sm-inline">➔</div>
                        <div className="flex-fill">
                          <span className={`badge ${b.status === "completed" ? "bg-success" : "bg-light text-muted border"} rounded-pill px-2 py-1`}>
                            5. Completed ⭐
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Security Completion OTP Card */}
                    {["pending", "approved", "arrived", "in_progress", "paid"].includes(b.status) && (
                      <div className="p-3.5 rounded-3 bg-warning-subtle text-dark border border-warning mb-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="fs-3">🔒</div>
                          <div>
                            <div className="fw-bold fs-6 d-flex align-items-center flex-wrap gap-2">
                              <span>Work Completion OTP:</span>
                              <span className="fs-4 text-danger font-monospace border border-danger bg-white px-2.5 py-0.5 rounded-3 fw-extrabold shadow-sm">
                                {b.completion_otp || "4892"}
                              </span>
                              <Badge variant="success" size="sm">Verified</Badge>
                            </div>
                            <div className="text-muted small mt-1">
                              Share this 4-digit code with the driver ONLY after farm work is 100% completed.
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResendOtp(b.id)}
                            icon={<FaRedo />}
                          >
                            New OTP
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Live GPS Dispatch Tracker */}
                    {["approved", "arrived", "in_progress", "paid"].includes(b.status) && (
                      <div className="mb-3">
                        <LiveDispatchTracker
                          booking={b}
                          driverName={
                            b.tractor_details?.owner_details?.first_name
                              ? `${b.tractor_details.owner_details.first_name} ${b.tractor_details.owner_details.last_name || ""}`
                              : "Ramesh Patel"
                          }
                          driverPhone={b.tractor_details?.owner_details?.phone || "+91 98765 43210"}
                        />
                      </div>
                    )}

                    {/* Owner Contact Card */}
                    <div className="p-3 rounded-3 bg-light border mb-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle p-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                            style={{ width: 40, height: 40, background: "var(--primary-600)" }}
                          >
                            <FaUser />
                          </div>
                          <div>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Tractor Owner & Operator:</div>
                            <div className="fw-bold text-dark fs-6">
                              {b.tractor_details?.owner_details?.first_name
                                ? `${b.tractor_details.owner_details.first_name} ${b.tractor_details.owner_details.last_name || ""}`
                                : "Ramesh Patel (Owner)"}
                            </div>
                            <div className="text-muted small d-flex align-items-center gap-1">
                              <FaMapMarkerAlt className="text-danger" />
                              <span>{b.tractor_details?.location || "Sanand"}, {b.tractor_details?.district || "Ahmedabad"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <a
                            href={`tel:${b.tractor_details?.owner_details?.phone || "+919876543210"}`}
                            className="btn btn-outline-success btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm text-decoration-none"
                          >
                            <FaPhoneAlt /> Call Owner
                          </a>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${(
                              b.tractor_details?.owner_details?.phone || "919876543210"
                            ).replace(/[^0-9]/g, "")}&text=${encodeURIComponent(
                              `Hello ${b.tractor_details?.owner_details?.first_name || "Owner"}, I have booked your tractor ${b.tractor_details?.name} (REF: TRC${b.id.toString().padStart(5, "0")}) on TRACTO.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm text-decoration-none"
                          >
                            <FaWhatsapp /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="row g-3 align-items-center pt-2 border-top">
                      <div className="col-12 col-md-4">
                        <div className="text-muted small d-flex align-items-center gap-1 mb-0.5">
                          <FaCalendarAlt className="text-primary" /> Schedule Duration:
                        </div>
                        <div className="fw-semibold text-dark small">
                          {b.start_date} to {b.end_date} ({b.rental_units} {b.rental_duration_type === "hourly" ? "Hours" : "Days"})
                        </div>
                      </div>

                      <div className="col-12 col-md-3">
                        <div className="text-muted small mb-0.5">Total Amount:</div>
                        <div className="fs-4 fw-extrabold text-success font-monospace font-heading">₹{b.total_amount}</div>
                      </div>

                      <div className="col-12 col-md-5 d-flex flex-wrap justify-content-md-end gap-2">
                        {b.status === "approved" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedPaymentBooking(b)}
                            icon={<FaCreditCard />}
                          >
                            Pay ₹{b.total_amount} Now
                          </Button>
                        )}

                        {["paid", "completed"].includes(b.status) && (
                          <Link
                            to={`/invoice/${b.id}`}
                            target="_blank"
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 fw-semibold"
                          >
                            <FaFileInvoice /> Tax Invoice
                          </Link>
                        )}

                        {["paid", "completed"].includes(b.status) &&
                          (b.review ? (
                            <Badge variant="warning" size="md">
                              <FaStar /> Reviewed ({b.review.rating}★)
                            </Badge>
                          ) : (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => setSelectedReviewBooking(b)}
                              icon={<FaStar />}
                            >
                              Rate & Review
                            </Button>
                          ))}

                        {["pending", "approved"].includes(b.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(b.id)}
                            icon={<FaTimesCircle />}
                            className="text-danger border-danger"
                          >
                            Cancel
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