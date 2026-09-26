import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaPrint, FaTractor, FaArrowLeft, FaCheckCircle, FaFileContract, FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

function InvoiceView() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`bookings/${bookingId}/`);
      setBooking(res.data);
    } catch (err) {
      console.error("Error loading invoice booking:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
        <p className="text-muted small mt-3">Loading invoice documentation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mb-3">Invoice not found.</div>
        <Button variant="primary" onClick={() => navigate("/my-bookings")}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const invoiceNum = `TRC-${booking.id.toString().padStart(6, "0")}`;

  return (
    <div className="bg-light min-vh-100 py-4">
      {/* Non-printable action header */}
      <div className="container no-print mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ maxWidth: 860 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/my-bookings")}
          icon={<FaArrowLeft />}
        >
          Back to My Bookings
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          icon={<FaPrint />}
        >
          Print Invoice / Save PDF
        </Button>
      </div>

      <div className="container" style={{ maxWidth: 860 }} id="printable-invoice">
        {/* Printable Card Container */}
        <div className="bg-white rounded-4 border p-4 p-md-5 shadow-sm position-relative overflow-hidden">
          {/* PAID Watermark */}
          {["paid", "completed"].includes(booking.status) && (
            <div
              className="position-absolute top-50 start-50 translate-middle pointer-events-none select-none text-uppercase fw-extrabold border border-5 border-success p-3 rounded-4"
              style={{
                fontSize: "4.5rem",
                color: "#10b981",
                opacity: 0.08,
                transform: "translate(-50%, -50%) rotate(-25deg)",
                letterSpacing: "0.2em",
                zIndex: 1,
              }}
            >
              PAID ✔
            </div>
          )}

          {/* Invoice Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4 flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 fw-extrabold text-success fs-3 mb-1 font-heading">
                <FaTractor /> TRACTO
              </div>
              <p className="text-muted small m-0">Agricultural Equipment & Tractor Rental Platform</p>
              <p className="text-muted small m-0">Gujarat, India • Helpline: +91 98765 43210</p>
            </div>

            <div className="text-md-end">
              <Badge variant="success" size="md" className="mb-2">TAX INVOICE</Badge>
              <h5 className="fw-extrabold text-dark m-0 font-heading">{invoiceNum}</h5>
              <div className="text-muted small mt-1">Date: {new Date(booking.created_at || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Customer & Tractor Details Grid */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6">
              <h6 className="fw-bold text-dark text-uppercase small mb-2 font-heading">Billed To (Customer):</h6>
              <div className="p-3 bg-light rounded-3 border">
                <div className="fw-bold text-dark">{booking.customer_details?.first_name || "Customer"} {booking.customer_details?.last_name || ""}</div>
                <div className="text-muted small">{booking.customer_details?.email}</div>
                <div className="text-muted small">{booking.customer_details?.phone || "No phone provided"}</div>
                <div className="text-muted small mt-1"><strong>Destination:</strong> {booking.purpose || "Farm Field"}</div>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <h6 className="fw-bold text-dark text-uppercase small mb-2 font-heading">Equipment & Owner:</h6>
              <div className="p-3 bg-light rounded-3 border">
                <div className="fw-bold text-dark">{booking.tractor_details?.name || "Mahindra 575 DI"}</div>
                <div className="text-muted small"><strong>Brand:</strong> {booking.tractor_details?.brand || "Mahindra"} ({booking.tractor_details?.horsepower || 45} HP)</div>
                <div className="text-muted small"><strong>Owner:</strong> {booking.tractor_details?.owner_details?.first_name || "Owner"} {booking.tractor_details?.owner_details?.last_name || ""}</div>
                <div className="text-muted small"><strong>Status:</strong> <span className="text-capitalize text-success fw-bold">{booking.status}</span></div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: "40%" }}>Item Description</th>
                  <th scope="col" className="text-center">Rate</th>
                  <th scope="col" className="text-center">Duration</th>
                  <th scope="col" className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="fw-bold text-dark">{booking.tractor_details?.name}</div>
                    <small className="text-muted">
                      {booking.rental_duration_type === "daily" ? "Daily machinery rental" : "Hourly machinery rental"}
                    </small>
                  </td>
                  <td className="text-center font-monospace">
                    ₹{booking.rental_duration_type === "daily" ? booking.tractor_details?.rent_per_day : booking.tractor_details?.rent_per_hour}
                  </td>
                  <td className="text-center">
                    {booking.rental_units} {booking.rental_duration_type === "daily" ? "Days" : "Hours"}
                  </td>
                  <td className="text-end fw-bold font-monospace">
                    ₹{booking.rental_duration_type === "daily"
                      ? (parseFloat(booking.tractor_details?.rent_per_day || 0) * booking.rental_units)
                      : (parseFloat(booking.tractor_details?.rent_per_hour || 0) * booking.rental_units)}
                  </td>
                </tr>

                {booking.selected_implements_details?.map((impl) => (
                  <tr key={impl.id}>
                    <td>
                      <div className="fw-semibold text-dark">{impl.name}</div>
                      <small className="text-muted">Implement attachment addon</small>
                    </td>
                    <td className="text-center font-monospace">
                      ₹{booking.rental_duration_type === "daily" ? impl.rent_per_day : impl.rent_per_hour}
                    </td>
                    <td className="text-center">
                      {booking.rental_units} {booking.rental_duration_type === "daily" ? "Days" : "Hours"}
                    </td>
                    <td className="text-end fw-bold font-monospace">
                      ₹{booking.rental_duration_type === "daily"
                        ? (parseFloat(impl.rent_per_day || 0) * booking.rental_units)
                        : (parseFloat(impl.rent_per_hour || 0) * booking.rental_units)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                  <td className="text-end fw-bold font-monospace">₹{booking.total_amount}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Platform GST / Taxes (0% Agro Exemption):</td>
                  <td className="text-end font-monospace">₹0.00</td>
                </tr>
                <tr className="table-light">
                  <td colSpan="3" className="text-end fw-extrabold fs-6">Grand Total:</td>
                  <td className="text-end fw-extrabold text-success fs-5 font-monospace font-heading">
                    ₹{booking.total_amount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terms & Verification Sign-off */}
          <div className="border-top pt-4 text-muted small">
            <h6 className="fw-bold text-dark font-heading">Terms & Agreement Summary:</h6>
            <ol className="ps-3 mb-3 leading-relaxed" style={{ fontSize: "0.785rem" }}>
              <li>Equipment delivered under this receipt is solely for agricultural farm use specified in booking.</li>
              <li>Operator fuel expenses and standard wear & tear coverage are subject to the direct mutual rental agreement.</li>
              <li>In case of breakdown, TRACTO platform provides emergency logistics support and refund resolution.</li>
            </ol>
            <div className="d-flex justify-content-between pt-3 mt-3 border-top text-center">
              <div>
                <div className="border-bottom pb-3 mb-1" style={{ width: 140 }}></div>
                <span className="small text-muted">Customer Signature</span>
              </div>
              <div>
                <div className="border-bottom pb-3 mb-1" style={{ width: 140 }}></div>
                <span className="small text-muted">Authorized TRACTO Stamp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
