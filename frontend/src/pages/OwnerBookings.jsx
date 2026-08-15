import { useState, useEffect } from "react";
import { FaBookmark, FaCheck, FaTimes, FaCheckDouble, FaUser, FaPhone, FaCalendarAlt, FaTractor, FaMapMarkerAlt, FaPlay, FaTruck } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("bookings/");
      setBookings(res.data.results || res.data || []);
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
                  <FaBookmark className="text-success" /> Live On-Demand Rental Dispatch (Uber / Rapido Style)
                </h2>
                <p className="text-muted small">Manage customer rental requests, dispatch driver/tractor to field, and update live work status</p>
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
                {filteredBookings.map((b) => (
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

                    <div className="row g-3 align-items-center">
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

                      {/* Live Uber Driver Dispatch Actions */}
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